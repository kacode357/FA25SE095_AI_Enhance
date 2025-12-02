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
import { useEffect, useRef, useState } from "react";
import Avatar from "./chat/Avatar";
import Composer from "./chat/Composer";
import MessageList from "./chat/MessageList";
import { parseServerDate } from "./chat/chatUtils";

/* ===== Utils ===== */
const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

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

        const sorted = msgs.sort((a, b) => parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime());
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
                        <MessageList
                            messages={messages}
                            currentUserId={currentUserId}
                            listRef={listRef}
                            loadingHistory={loadingHistory}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                            setConfirmId={setConfirmId}
                            typingText={typingText}
                        />

                        <Composer input={input} setInput={setInput} onSend={onSend} sending={sending} />

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
