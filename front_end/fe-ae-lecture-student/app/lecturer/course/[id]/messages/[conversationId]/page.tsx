"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";

import { useAuth } from "@/contexts/AuthContext";
import { useDeleteMessage } from "@/hooks/chat/useDeleteMessage";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { useResolveSupportRequest } from "@/hooks/support-requests/useResolveSupportRequest";

import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";

import { getSavedAccessToken } from "@/utils/auth/access-token";

import ResolveSupportRequestDialog from "@/app/student/courses/[id]/support/components/ResolveSupportRequestDialog";
import { buildChatTimeline, parseServerDate } from "@/utils/chat/time";
import ChatComposer from "./components/ChatComposer";
import ChatHeader from "./components/ChatHeader";
import ChatList from "./components/ChatList";

/* ===== Utils ===== */
const cx = (...a: Array<string | false | undefined>) =>
    a.filter(Boolean).join(" ");

/** Generate temp id cho optimistic message */
const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;


const initial = (name?: string) =>
    name?.trim()?.[0]?.toUpperCase() ?? "?";

/* ===== Page (Lecturer) ===== */
export default function LecturerSupportChatPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const courseId = useMemo(() => {
        const id = params?.id;
        return typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
    }, [params]);

    const conversationId = useMemo(() => {
        const cid = (params as any)?.conversationId;
        return typeof cid === "string" ? cid : Array.isArray(cid) ? cid[0] : "";
    }, [params]);

    const peerId = searchParams.get("peerId");
    const peerName = searchParams.get("peerName") ?? "Support Staff";
    const requestTitle = searchParams.get("requestTitle") ?? searchParams.get("supportRequestTitle") ?? null;

    const currentUserId = user?.id ?? null;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    // trạng thái cho confirm "Has your need been resolved?"
    const { resolveSupportRequest, loading: resolving } =
        useResolveSupportRequest();
    const [resolveHandled, setResolveHandled] = useState(false);
    const [isResolved, setIsResolved] = useState(false); // sau khi confirm resolved thì khóa chat

    // scroll
    const listRef = useRef<HTMLDivElement | null>(null);
    const scrollBottom = () =>
        requestAnimationFrame(() => {
            if (listRef.current)
                listRef.current.scrollTop = listRef.current.scrollHeight;
        });

    const { getConversationMessages, loading: loadingMsgs } =
        useGetConversationMessages();
    const { deleteMessage, loading: deleting } = useDeleteMessage();
    const loadingHistory = loadingMsgs;

    // optimistic map
    const pendingRef = useRef<
        Map<string, { createdAt: number; message: string; receiverId: string }>
    >(new Map());

    const sendingRef = useRef(false);

    // tránh spam load history
    const lastLoadedConvRef = useRef<string | null>(null);

    // Hub
    const {
        connect,
        sendMessage,
        startTyping,
        stopTyping,
        deleteMessageHub,
    } = useChatHub({
        getAccessToken: () => getSavedAccessToken() ?? "",
        onReceiveMessagesBatch: (batch) => {
            if (!batch?.length) return;
            setMessages((prev) => {
                const byId = new Map(prev.map((m) => [m.id, m]));

                for (const it of batch) {
                    if (currentUserId && it.senderId === currentUserId) {
                        // replace temp message bằng server echo nếu match
                        for (const [tempId, p] of pendingRef.current) {
                            const within7s = Date.now() - p.createdAt <= 7000;
                            if (
                                within7s &&
                                p.receiverId === it.receiverId &&
                                p.message === it.message &&
                                byId.has(tempId)
                            ) {
                                byId.delete(tempId);
                                byId.set(it.id, it);
                                pendingRef.current.delete(tempId);
                                break;
                            }
                        }
                        if (!byId.has(it.id)) byId.set(it.id, it);
                    } else {
                        byId.set(it.id, it);
                    }
                }

                const next = Array.from(byId.values()).sort(
                    (a, b) =>
                        parseServerDate(a.sentAt).getTime() -
                        parseServerDate(b.sentAt).getTime(),
                );
                return next.length > 500 ? next.slice(-500) : next;
            });
            scrollBottom();
        },
        onTyping: ({ userId, isTyping }) =>
            setTypingMap((prev) =>
                prev[userId] === isTyping ? prev : { ...prev, [userId]: isTyping },
            ),
        onMessageDeleted: (id) =>
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m,
                ),
            ),
        debounceMs: 500,
    });

    /* ===== Load history (mỗi conversation 1 lần) ===== */
    const loadHistory = useRef(
        async (convId: string | null | undefined) => {
            if (!convId) return;
            if (lastLoadedConvRef.current === convId) return;
            lastLoadedConvRef.current = convId;

            const rawMsgs: any = await getConversationMessages(convId, {
                pageNumber: 1,
                pageSize: 50,
            });
            const msgs: ChatMessage[] = Array.isArray(rawMsgs)
                ? rawMsgs
                : rawMsgs?.messages ?? [];
            const sorted = msgs.sort(
                (a, b) =>
                    parseServerDate(a.sentAt).getTime() -
                    parseServerDate(b.sentAt).getTime(),
            );
            setMessages(sorted);
            scrollBottom();
        },
    ).current;

    // connect & load history
    useEffect(() => {
        if (!peerId || !conversationId) {
            setMessages([]);
            pendingRef.current.clear();
            lastLoadedConvRef.current = null;
            return;
        }

        lastLoadedConvRef.current = null;
        setResolveHandled(false); // reset khi đổi conversation
        setIsResolved(false);

        let cancelled = false;
        (async () => {
            try {
                await connect();
                if (!cancelled) {
                    await loadHistory(conversationId);
                }
            } catch {
                // ignore
            }
        })();

        return () => {
            cancelled = true;
            // không disconnect ở đây để tránh lỗi HttpConnection
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [peerId, conversationId]);

    // typing edge-based
    const prevNonEmpty = useRef(false);
    useEffect(() => {
        if (!peerId) return;

        if (isResolved) {
            // nếu đã resolved thì đảm bảo không gửi typing nữa
            if (prevNonEmpty.current) {
                void stopTyping(peerId);
                prevNonEmpty.current = false;
            }
            return;
        }

        const nonEmpty = !!input.trim();
        if (!prevNonEmpty.current && nonEmpty) void startTyping(peerId);
        else if (prevNonEmpty.current && !nonEmpty) void stopTyping(peerId);
        prevNonEmpty.current = nonEmpty;

        return () => {
            if (prevNonEmpty.current && peerId) void stopTyping(peerId);
            prevNonEmpty.current = false;
        };
    }, [input, peerId, startTyping, stopTyping, isResolved]);

    // send
    const onSend = async () => {
        if (isResolved) return; // khóa chat sau khi resolved
        if (!peerId || !courseId || !currentUserId) return;
        if (sendingRef.current) return; // another send in progress

        const message = input.trim();
        if (!message) return;

        // acquire lock immediately to prevent double-submit on rapid Enter
        sendingRef.current = true;
        setSending(true);

        const tempId = uuid();
        const local: ChatMessage = {
            id: tempId,
            senderId: currentUserId,
            senderName: "Me",
            receiverId: peerId,
            receiverName: peerName,
            message,
            sentAt: new Date().toISOString(),
            isDeleted: false,
        };
        pendingRef.current.set(tempId, {
            createdAt: Date.now(),
            message,
            receiverId: peerId,
        });
        setMessages((prev) => {
            const next = [...prev, local];
            return next.length > 500 ? next.slice(-500) : next;
        });
        scrollBottom();

        try {
            const dto: SendMessagePayload = {
                courseId,
                receiverId: peerId,
                message,
            };
            await sendMessage(dto);
            setInput("");
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    };

    // close menu on outside/Esc
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!openMenuId) return;
            const t = e.target as HTMLElement;
            const inTrig = !!t.closest(`[data-trigger-id="${openMenuId}"]`);
            const inMenu = !!t.closest(`[data-menu-id="${openMenuId}"]`);
            if (!inTrig && !inMenu) setOpenMenuId(null);
        };
        const onKey = (e: KeyboardEvent) =>
            e.key === "Escape" && setOpenMenuId(null);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [openMenuId]);

    // confirm delete
    const onConfirmDelete = async () => {
        const id = confirmId;
        if (!id) return;
        setConfirmId(null);
        const isMine = !!messages.find(
            (m) => m.id === id && m.senderId === currentUserId,
        );
        if (!isMine || deleting) return;

        const ok = await deleteMessage(id);
        if (!ok) return;

        setMessages((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m,
            ),
        );
        try {
            await deleteMessageHub(id);
        } catch {
            /* ignore */
        }
    };

    const typingText =
        peerId && typingMap[peerId] && !isResolved
            ? `${peerName} is typing…`
            : "";

    // tìm message staff mới nhất hỏi "Has your need been resolved?"
    const resolveQuestionId = useMemo(() => {
        if (!currentUserId) return null;
        const haystack = messages.filter(
            (m) =>
                m.senderId !== currentUserId &&
                m.message.trim() === "Has your need been resolved?",
        );
        if (!haystack.length) return null;
        return haystack[haystack.length - 1].id;
    }, [messages, currentUserId]);

    const timeline = useMemo(() => buildChatTimeline(messages, currentUserId), [messages, currentUserId]);

    // hover/tooltips moved into ChatList component

    const showResolveDialog =
        !!resolveQuestionId && !resolveHandled && !isResolved;

    const handleConfirmResolved = async () => {
        const supportRequestId =
            searchParams.get("requestId") ??
            searchParams.get("supportRequestId") ??
            null;

        if (!supportRequestId) {
            // không có id thì chỉ đóng popup, không khóa chat
            setResolveHandled(true);
            return;
        }

        try {
            await resolveSupportRequest(supportRequestId);
            setResolveHandled(true);
            setIsResolved(true); // sau khi xác nhận xong thì khóa chat
        } catch {
            // lỗi interceptor xử lý, không đổi state
        }
    };

    const handleNotResolved = () => {
        setResolveHandled(true); // đóng popup nhưng vẫn chat tiếp
    };

    if (!courseId || !conversationId) {
        return (
            <div className="p-4 text-sm text-red-500">
                Missing courseId or conversationId.
            </div>
        );
    }

    return (
        <div className="h-screen max-w-7xl mx-auto flex flex-col">
            {/* Back + title */}
            <ChatHeader
                peerName={peerName}
                requestTitle={requestTitle}
                onBack={() => router.back()}
                onOpenSupportRequests={() => router.push("/lecturer/course/support-requests")}
            />

            <Card className="border-[var(--border)] -py-4 bg-[var(--card)] flex-1 min-h-0 flex flex-col shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                    {!peerId ? (
                        <div className="text-xs font-medium text-[var(--text-muted)]">
                            Missing staff information.
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-[var(--border)] shadow-sm">
                                <AvatarImage src={undefined} alt={peerName || "Support"} />
                                <AvatarFallback className="bg-[var(--background)] text-[var(--brand-700)] text-xs font-semibold">
                                    {initial(peerName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-nav truncate">
                                    {peerName}
                                </div>
                                <div className="text-[11px] text-[var(--text-muted)] truncate">
                                    Support staff
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body */}
                {!peerId ? (
                    <div className="flex flex-1 items-center justify-center px-6 py-4 text-xs text-[var(--text-muted)]">
                        Cannot open support chat. Please go back and try again.
                    </div>
                ) : (
                    <>
                        <ChatList
                            listRef={listRef}
                            loadingHistory={loadingHistory}
                            timeline={timeline}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                            setConfirmId={setConfirmId}
                            deleting={deleting}
                        />

                        {/* typing dưới input */}
                        {typingText && (
                            <div className="px-4 pt-1 text-[11px] text-[var(--text-muted)]">
                                {typingText}
                            </div>
                        )}

                        <ChatComposer
                            input={input}
                            setInput={setInput}
                            onSend={onSend}
                            sending={sending}
                            isResolved={isResolved}
                        />
                    </>
                )}
            </Card>

            {/* Confirm delete */}
            <ConfirmDeleteDialog
                confirmId={confirmId}
                setConfirmId={setConfirmId}
                onConfirmDelete={onConfirmDelete}
                deleting={deleting}
            />

            {/* Overlay xác nhận đã giải quyết – gọi component riêng */}
            <ResolveSupportRequestDialog
                open={showResolveDialog}
                peerName={peerName}
                resolving={resolving}
                onConfirmResolved={handleConfirmResolved}
                onNotResolved={handleNotResolved}
            />
        </div>
    );
}
