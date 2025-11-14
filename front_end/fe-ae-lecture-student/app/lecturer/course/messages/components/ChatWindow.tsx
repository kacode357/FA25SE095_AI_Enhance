"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteMessage } from "@/hooks/chat/useDeleteMessage";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type {
    ChatMessageItemResponse as ChatMessage,
    CourseChatUserItemResponse as ChatUser,
} from "@/types/chat/chat.response";
import { useEffect, useMemo, useRef, useState } from "react";

/* ===== Utils ===== */
const cx = (...a: Array<string | false | undefined>) => a.filter(Boolean).join(" ");
const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

/** Parse datetime từ BE:
 * - Nếu thiếu timezone => coi là UTC, gắn 'Z'
 * - Clamp phần nghìn giây về 3 chữ số để Date parse ổn định
 */
function parseServerDate(ts: string): Date {
    if (!ts) return new Date(NaN);
    const clamped = ts.replace(/(\.\d{3})\d+$/, "$1");
    const hasTZ = /Z|[+\-]\d{2}:\d{2}$/.test(clamped);
    const iso = hasTZ ? clamped : clamped + "Z";
    return new Date(iso);
}

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const mins = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

const timeHHmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const dayLabel = (d: Date) => {
    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (sameDay(d, now)) return "Today";
    if (sameDay(d, y)) return "Yesterday";
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
};

const initial = (name?: string) => (name?.trim()?.[0]?.toUpperCase() ?? "?");

/* ===== Avatar với fallback chữ cái ===== */
function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string; size?: number }) {
    const style = { width: size, height: size };
    if (!src) {
        return (
            <div
                className="rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold select-none"
                style={style}
            >
                {initial(name)}
            </div>
        );
    }
    return (
        <>
            <img
                src={src}
                alt={name || "avatar"}
                className="rounded-full object-cover"
                style={style}
                onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const sib = el.nextElementSibling as HTMLDivElement | null;
                    if (sib) sib.style.display = "flex";
                }}
            />
            <div
                className="rounded-full bg-gray-200 text-gray-700 items-center justify-center font-semibold select-none"
                style={{ ...style, display: "none" }}
            >
                {initial(name)}
            </div>
        </>
    );
}

/* ===== Props ===== */
type Props = {
    courseId: string;
    currentUserId: string | null;
    selectedUser: ChatUser | null;
    getAccessToken: () => string;
};

export default function ChatWindow({ courseId, currentUserId, selectedUser, getAccessToken }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    // scroll
    const listRef = useRef<HTMLDivElement | null>(null);
    const scrollBottom = () =>
        requestAnimationFrame(() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
        });

    // hooks
    const { getConversations, loading: loadingConvs } = useGetConversations();
    const { getConversationMessages, loading: loadingMsgs } = useGetConversationMessages();
    const { deleteMessage, loading: deleting } = useDeleteMessage();
    const loadingHistory = loadingConvs || loadingMsgs;

    // optimistic map
    const pendingRef = useRef<Map<string, { createdAt: number; message: string; receiverId: string }>>(new Map());

    // Hub
    const { connect, disconnect, sendMessage, startTyping, stopTyping, deleteMessageHub } = useChatHub({
        getAccessToken,
        onReceiveMessagesBatch: (batch) => {
            if (!batch?.length) return;
            setMessages((prev) => {
                const byId = new Map(prev.map((m) => [m.id, m]));
                for (const it of batch) {
                    if (currentUserId && it.senderId === currentUserId) {
                        // replace temp by server echo
                        for (const [tempId, p] of pendingRef.current) {
                            const within7s = Date.now() - p.createdAt <= 7000;
                            if (within7s && p.receiverId === it.receiverId && p.message === it.message && byId.has(tempId)) {
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
                    (a, b) => parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime()
                );
                return next.length > 500 ? next.slice(-500) : next;
            });
            scrollBottom();
        },
        onTyping: ({ userId, isTyping }) =>
            setTypingMap((prev) => (prev[userId] === isTyping ? prev : { ...prev, [userId]: isTyping })),
        onMessageDeleted: (id) =>
            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m))),
        debounceMs: 500,
    });

    /* ===== Load history (normalize cả conversations & messages) ===== */
    const loadHistory = useRef(async (peerId: string) => {
        if (!courseId) return;

        // 1) Conversations: hook có thể trả mảng hoặc { conversations: [] }
        const rawConvs: any = await getConversations({ courseId });
        const conversations = Array.isArray(rawConvs) ? rawConvs : rawConvs?.conversations ?? [];

        const conv =
            conversations.find((c: any) => c.otherUserId === peerId && c.courseId === courseId) ??
            conversations.find((c: any) => c.otherUserId === peerId) ??
            null;

        if (!conv) {
            setMessages([]);
            return;
        }

        // 2) Messages: hook có thể trả mảng hoặc { messages: [] }
        const rawMsgs: any = await getConversationMessages(conv.id, { pageNumber: 1, pageSize: 50 });
        const msgs: ChatMessage[] = Array.isArray(rawMsgs) ? rawMsgs : rawMsgs?.messages ?? [];

        const sorted = msgs.sort(
            (a, b) => parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime()
        );
        setMessages(sorted);
        scrollBottom();
    }).current;

    // connect & switch peer
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!selectedUser) {
                await disconnect();
                setMessages([]);
                pendingRef.current.clear();
                return;
            }
            try {
                await connect();
                if (!cancelled) await loadHistory(selectedUser.id);
            } catch {
                /* ignore */
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUser]);

    // typing edge-based
    const prevNonEmpty = useRef(false);
    useEffect(() => {
        if (!selectedUser) return;
        const nonEmpty = !!input.trim();
        if (!prevNonEmpty.current && nonEmpty) void startTyping(selectedUser.id);
        else if (prevNonEmpty.current && !nonEmpty) void stopTyping(selectedUser.id);
        prevNonEmpty.current = nonEmpty;
        return () => {
            if (prevNonEmpty.current && selectedUser) void stopTyping(selectedUser.id);
            prevNonEmpty.current = false;
        };
    }, [input, selectedUser, startTyping, stopTyping]);

    // send
    const onSend = async () => {
        if (!selectedUser || !courseId || !currentUserId) return;
        const message = input.trim();
        if (!message) return;

        const tempId = uuid();
        const local: ChatMessage = {
            id: tempId,
            senderId: currentUserId,
            senderName: "Me",
            receiverId: selectedUser.id,
            receiverName: selectedUser.fullName,
            message,
            sentAt: new Date().toISOString(), // ISO có 'Z' -> UTC
            isDeleted: false,
        };
        pendingRef.current.set(tempId, { createdAt: Date.now(), message, receiverId: selectedUser.id });
        setMessages((prev) => {
            const next = [...prev, local];
            return next.length > 500 ? next.slice(-500) : next;
        });
        scrollBottom();

        try {
            setSending(true);
            const dto: SendMessagePayload = { courseId, receiverId: selectedUser.id, message };
            await sendMessage(dto);
            setInput(""); // sẽ kích stopTyping
        } finally {
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
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenuId(null);
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
        const isMine = !!messages.find((m) => m.id === id && m.senderId === currentUserId);
        if (!isMine || deleting) return;

        const ok = await deleteMessage(id);
        if (!ok) return;

        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m)));
        try {
            await deleteMessageHub(id);
        } catch {
            /* ignore */
        }
    };

    // render: day separators + clusters
    const rendered = useMemo(() => {
        const out: Array<
            | { kind: "sep"; id: string; label: string }
            | { kind: "msg"; m: ChatMessage; isMine: boolean; showTime: boolean }
        > = [];
        for (let i = 0; i < messages.length; i++) {
            const m = messages[i];
            const d = parseServerDate(m.sentAt);
            if (i === 0 || !sameDay(parseServerDate(messages[i - 1].sentAt), d)) {
                out.push({ kind: "sep", id: `sep-${d.toDateString()}`, label: dayLabel(d) });
            }
            const next = messages[i + 1];
            const showTime = !(next && next.senderId === m.senderId && mins(parseServerDate(next.sentAt), d) <= 5);
            const isMine = !!currentUserId && m.senderId === currentUserId;
            out.push({ kind: "msg", m, isMine, showTime });
        }
        return out;
    }, [messages, currentUserId]);

    const typingText = selectedUser && typingMap[selectedUser.id] ? `${selectedUser.fullName} is typing…` : "";

    return (
        <section className="col-span-12 md:col-span-6 lg:col-span-7 xl:col-span-8">
            <div className="border border-gray-200 rounded-xl bg-white h-[640px] flex flex-col">
                {/* Header */}
                <div className="p-3 border-b border-gray-100">
                    {!selectedUser ? (
                        <div className="text-sm text-gray-500">Select a user to start.</div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Avatar src={selectedUser.profilePictureUrl} name={selectedUser.fullName} />
                            <div className="min-w-0">
                                <div className="font-medium truncate">{selectedUser.fullName}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body */}
                {!selectedUser ? (
                    <div className="p-6 text-sm text-gray-500">Pick someone on the left to start chatting.</div>
                ) : (
                    <>
                        <div ref={listRef} className="relative flex-1 overflow-y-auto p-4 space-y-3">
                            {loadingHistory && <div className="text-sm text-gray-500">Loading history…</div>}
                            {!loadingHistory && messages.length === 0 && (
                                <div className="text-sm text-gray-500">No messages yet. Say hi!</div>
                            )}

                            {rendered.map((it) =>
                                it.kind === "sep" ? (
                                    <div key={it.id} className="sticky top-0 z-10">
                                        <div className="my-4 flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gray-200" />
                                            <div className="text-xs text-gray-500">{it.label}</div>
                                            <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                    </div>
                                ) : (
                                    <div key={it.m.id} className={cx(it.isMine ? "flex justify-end" : "flex justify-start")}>
                                        <div
                                            className={cx(
                                                "group relative w-fit max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                                                it.isMine ? "bg-black text-white" : "bg-gray-100"
                                            )}
                                            title={it.showTime ? timeHHmm(parseServerDate(it.m.sentAt)) : undefined}
                                        >
                                            {/* ⋮ menu */}
                                            {it.isMine && !it.m.isDeleted && (
                                                <div className="absolute left-[-28px] top-1/2 -translate-y-1/2">
                                                    <button
                                                        data-trigger-id={it.m.id}
                                                        className={cx(
                                                            "w-6 h-6 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center transition-opacity",
                                                            openMenuId === it.m.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId((id) => (id === it.m.id ? null : it.m.id));
                                                        }}
                                                        aria-label="Message actions"
                                                        aria-expanded={openMenuId === it.m.id}
                                                        title="More"
                                                    >
                                                        <span className="leading-none">⋮</span>
                                                    </button>

                                                    {openMenuId === it.m.id && (
                                                        <div
                                                            data-menu-id={it.m.id}
                                                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-44 rounded-lg border border-gray-200 bg-white shadow-lg text-gray-700 text-sm py-1"
                                                        >
                                                            <button
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                                                onClick={() => {
                                                                    setConfirmId(it.m.id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="min-w-0 break-words">
                                                <div className="whitespace-pre-wrap">{it.m.isDeleted ? "[deleted]" : it.m.message}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {typingText && <div className="text-xs text-gray-500">{typingText}</div>}
                        </div>

                        {/* Composer */}
                        <div className="p-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            void onSend();
                                        }
                                    }}
                                    placeholder="Write a message..."
                                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                />
                                <button
                                    disabled={sending}
                                    onClick={() => void onSend()}
                                    className="rounded-xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                        <AlertDialog open={!!confirmId} onOpenChange={(v) => !v && setConfirmId(null)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete message</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to delete this message?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => void onConfirmDelete()}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </div>
        </section>
    );
}
