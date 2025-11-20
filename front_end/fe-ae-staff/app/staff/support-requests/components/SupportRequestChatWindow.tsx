"use client";

import { Button } from "@/components/ui/button";
import { useDeleteMessage } from "@/hooks/chat/useDeleteMessage";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type {
    ChatMessageItemResponse as ChatMessage,
} from "@/types/chat/chat.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
    courseId: string;
    currentUserId: string | null;
    peerId: string;
    peerName: string;
    conversationId?: string | null;
    onClose?: () => void;
};

const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

function parseServerDate(ts: string) {
    if (!ts) return new Date(NaN);
    const clamped = ts.replace(/(\.\d{3})\d+$/, "$1");
    const hasTZ = /Z|[+\-]\d{2}:\d{2}$/.test(clamped);
    const iso = hasTZ ? clamped : clamped + "Z";
    return new Date(iso);
}

export default function SupportRequestChatWindow({
    courseId,
    currentUserId,
    peerId,
    peerName,
    conversationId: initialConvId,
    onClose,
}: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    // control when heavy work (REST + SignalR connect) starts so UI can render first
    const [started, setStarted] = useState(false);

    const pendingRef = useRef(new Map<string, { createdAt: number; message: string; receiverId: string }>());
    // recent sends to prevent duplicate send calls (signature -> timestamp)
    const recentSendsRef = useRef(new Map<string, number>());

    const { getConversations } = useGetConversations();
    const { getConversationMessages } = useGetConversationMessages();
    const { deleteMessage, loading: deleting } = useDeleteMessage();

    const [conversationId, setConversationId] = useState<string | null>(initialConvId ?? null);

    const tokenProvider = useCallback(() => getSavedAccessToken() || "", []);

    const handleReceiveMessagesBatch = useCallback((batch: ChatMessage[] | undefined) => {
        if (!batch?.length) return;
        setMessages((prev) => {
            // use a signature set to avoid duplicates coming from multiple hub events
            const byId = new Map(prev.map((m) => [m.id, m]));
            const sigSet = new Set<string>();
            for (const m of prev) {
                const sig = `${m.senderId}|${m.receiverId}|${m.message}|${Math.round(new Date(m.sentAt).getTime() / 1000)}`;
                sigSet.add(sig);
            }

            for (const it of batch) {
                // compute signature for dedupe
                const sig = `${it.senderId}|${it.receiverId}|${it.message}|${Math.round(new Date(it.sentAt).getTime() / 1000)}`;

                // replace temp if possible
                let replacedTemp = false;
                for (const [tempId, p] of pendingRef.current) {
                    const within7s = Date.now() - p.createdAt <= 7000;
                    if (within7s && p.receiverId === it.receiverId && p.message === it.message && byId.has(tempId)) {
                        // remove temp message and its signature
                        const temp = byId.get(tempId)!;
                        const tempSig = `${temp.senderId}|${temp.receiverId}|${temp.message}|${Math.round(new Date(temp.sentAt).getTime() / 1000)}`;
                        if (sigSet.has(tempSig)) sigSet.delete(tempSig);
                        byId.delete(tempId);
                        byId.set(it.id, it);
                        sigSet.add(sig);
                        pendingRef.current.delete(tempId);
                        replacedTemp = true;
                        break;
                    }
                }

                if (replacedTemp) continue;

                // skip if signature already present (duplicate)
                if (sigSet.has(sig)) continue;

                if (!byId.has(it.id)) {
                    byId.set(it.id, it);
                    sigSet.add(sig);
                }
            }

            const next = Array.from(byId.values()).sort((a, b) => parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime());
            return next.length > 500 ? next.slice(-500) : next;
        });
    }, []);

    const [peerTyping, setPeerTyping] = useState(false);
    const typingSignalTimerRef = useRef<number | null>(null);
    const clearTypingSignalTimer = useCallback(() => {
        if (typingSignalTimerRef.current) {
            clearTimeout(typingSignalTimerRef.current);
            typingSignalTimerRef.current = null;
        }
    }, []);

    // local typing debounce (for sending StartTyping/StopTyping)
    const localTypingTimerRef = useRef<number | null>(null);
    const clearLocalTypingTimer = useCallback(() => {
        if (localTypingTimerRef.current) {
            clearTimeout(localTypingTimerRef.current);
            localTypingTimerRef.current = null;
        }
    }, []);

    const handleTyping = useCallback((payload?: { userId: string; isTyping: boolean }) => {
        if (!payload || !payload.userId) return;
        // only consider typing events from the peer
        if (payload.userId !== peerId) return;
        if (payload.isTyping) {
            setPeerTyping(true);
            clearTypingSignalTimer();
            // clear after 2.5s if no further typing signal
            typingSignalTimerRef.current = window.setTimeout(() => {
                setPeerTyping(false);
                typingSignalTimerRef.current = null;
            }, 2500);
        } else {
            setPeerTyping(false);
            clearTypingSignalTimer();
        }
    }, [peerId, clearTypingSignalTimer]);

    const { connect, disconnect, sendMessage, startTyping, stopTyping } = useChatHub({
        getAccessToken: tokenProvider,
        onReceiveMessagesBatch: handleReceiveMessagesBatch,
        onTyping: handleTyping,
    });

    // load conversation id & messages (deferred until UI shows)
    useEffect(() => {
        if (!started) return;
        let cancelled = false;
        (async () => {
            try {
                if (!conversationId) {
                    const convs: any = await getConversations({ courseId });
                    // eslint-disable-next-line no-console
                    const list = Array.isArray(convs) ? convs : convs?.conversations ?? [];
                    const conv = list.find((c: any) => c.otherUserId === peerId && c.courseId === courseId) ?? null;
                    if (conv) setConversationId(conv.id);
                    else setConversationId(null);
                }

                if (!conversationId) return;
                const raw: any = await getConversationMessages(conversationId, { pageNumber: 1, pageSize: 50 });
                const msgs: ChatMessage[] = Array.isArray(raw) ? raw : (raw?.messages ?? []);
                if (!cancelled)
                    setMessages(
                        msgs.sort((a: ChatMessage, b: ChatMessage) =>
                            parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime()
                        )
                    );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("chat: load conv/messages error", e);
                // ignore
            }
        })();
        return () => {
            cancelled = true;
        };
        // intentionally exclude stable hook functions from deps to avoid re-running
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, courseId, peerId, conversationId]);

    // connect to hub after UI rendered (deferred)
    useEffect(() => {
        if (!started) return;
        let cancelled = false;
        (async () => {
            try {
                await connect();
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("chat: connect error", e);
            }
        })();
        return () => {
            cancelled = true;
            try {
                disconnect();
            } catch { }
        };
    }, [started, connect, disconnect]);

    // schedule start after a short timeout so modal renders first
    useEffect(() => {
        const t = setTimeout(() => setStarted(true), 80);
        return () => clearTimeout(t);
    }, []);

    const onSend = async () => {
        if (!peerId || !courseId || !currentUserId) return;
        const message = input.trim();
        if (!message) return;
        const sig = `${courseId}|${peerId}|${message}`;
        const now = Date.now();
        const last = recentSendsRef.current.get(sig) ?? 0;
        // if sent recently (5s), ignore duplicate send
        if (now - last < 5000) {
            // eslint-disable-next-line no-console
            console.warn("chat:onSend - duplicate blocked", { sig, last, now });
            return;
        }
        recentSendsRef.current.set(sig, now);
        // expire after 5s
        setTimeout(() => recentSendsRef.current.delete(sig), 5000);

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
        } as unknown as ChatMessage;
        pendingRef.current.set(tempId, { createdAt: Date.now(), message, receiverId: peerId });
        setMessages((prev) => {
            const next = [...prev, local];
            return next.length > 500 ? next.slice(-500) : next;
        });
        try {
            setSending(true);
            const dto: SendMessagePayload = { courseId, receiverId: peerId, message };
            await sendMessage(dto);
            setInput("");
            // stop typing immediately after send
            try { if (peerId) void stopTyping(peerId); } catch { }
            clearLocalTypingTimer();
        } finally {
            setSending(false);
        }
    };

    const rendered = useMemo(() => messages, [messages]);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const messagesRef = useRef<HTMLDivElement | null>(null);
    const footerRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const shouldAutoScrollRef = useRef(true);
    const [footerHeight, setFooterHeight] = useState(0);
    const [footerRect, setFooterRect] = useState<{ left: number; width: number } | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [headerRect, setHeaderRect] = useState<{ top: number; left: number; width: number } | null>(null);

    // scroll to bottom when messages change, but only if the user is near bottom
    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom > 200) {
            // user scrolled up, don't auto-scroll
            shouldAutoScrollRef.current = false;
            return;
        }
        shouldAutoScrollRef.current = true;
        // smooth scroll a bit after layout
        const t = setTimeout(() => {
            try {
                el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            } catch {
                el.scrollTop = el.scrollHeight;
            }
        }, 30);
        return () => clearTimeout(t);
    }, [messages]);

    // if user scrolls, update shouldAutoScrollRef
    const onMessagesScroll = useCallback(() => {
        const el = messagesRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        shouldAutoScrollRef.current = distanceFromBottom <= 200;
    }, []);

    // compute footer position/size so we can fix it to viewport bottom
    useEffect(() => {
        const recompute = () => {
            const root = rootRef.current;
            const footer = footerRef.current;
            const header = headerRef.current;
            if (!root) return;
            const r = root.getBoundingClientRect();
            if (footer) setFooterHeight(Math.ceil(footer.getBoundingClientRect().height));
            if (footer) setFooterRect({ left: Math.max(r.left, 0), width: r.width });
            if (header) setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
            if (header) setHeaderRect({ top: Math.max(r.top, 0), left: Math.max(r.left, 0), width: r.width });
        };

        recompute();
        let raf = 0;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(recompute);
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onResize, true);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onResize, true);
        };
    }, []);

    // cleanup timers and typing signal on unmount
    useEffect(() => {
        return () => {
            clearLocalTypingTimer();
            clearTypingSignalTimer();
            try { if (peerId) void stopTyping(peerId); } catch { }
            try { if (peerId) void stopTyping(peerId); } catch { }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={rootRef} className="w-full h-screen flex flex-col">
            <div
                ref={headerRef}
                className="flex-none bg-white z-30 flex flex-col justify-center px-4 py-3 border-b shadow-sm"
                style={headerRect ? { position: "fixed", top: headerRect.top, left: headerRect.left, width: headerRect.width } : {}}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="text-lg font-semibold">Chat with {peerName || "User"}</div>
                    <div>
                        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </div>
                <div className="mt-1">
                    {peerTyping ? (
                        <div className="text-xs text-muted-foreground">{peerName || "User"} is typing…</div>
                    ) : (
                        <div className="text-xs text-muted-foreground opacity-0">&nbsp;</div>
                    )}
                </div>
            </div>

            <div
                ref={messagesRef}
                onScroll={onMessagesScroll}
                className="flex-1 overflow-y-auto px-6 pt-4 space-y-6 bg-[linear-gradient(transparent,transparent)]"
                style={{ paddingTop: headerHeight ? headerHeight + 12 : undefined, paddingBottom: footerHeight ? footerHeight + 20 : undefined }}
            >
                {rendered.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No messages yet.</div>
                ) : (
                    rendered.map((m) => (
                        <div key={m.id} className={`flex ${m.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
                            <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${m.senderId === currentUserId ? "bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md max-w-[45%] ml-auto" : "bg-white border max-w-[60%] shadow-sm"}`}>
                                {m.isDeleted ? <i className="opacity-70">[deleted]</i> : m.message}
                                <div className="text-[11px] text-muted-foreground mt-2">{new Date(m.sentAt).toLocaleString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* footer is visually inside the chat container but fixed to viewport bottom
                We measure the container to align the fixed footer horizontally */}
            <div
                ref={footerRef}
                className="flex-none border-t px-4 py-3 bg-white z-40 shadow-md"
                style={footerRect ? { position: "fixed", bottom: 0, left: footerRect.left, width: footerRect.width } : {}}
            >
                <div className="flex items-end gap-3">
                    <textarea
                        className="flex-1 rounded-xl border px-4 py-2 text-sm resize-none"
                        rows={2}
                        value={input}
                        onChange={(e) => {
                            const v = e.target.value;
                            setInput(v);
                            try { if (peerId) void startTyping(peerId); } catch { }
                            clearLocalTypingTimer();
                            localTypingTimerRef.current = window.setTimeout(() => {
                                try { if (peerId) void stopTyping(peerId); } catch { }
                                localTypingTimerRef.current = null;
                            }, 1500);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void onSend();
                            } else {
                                try { if (peerId) void startTyping(peerId); } catch { }
                                clearLocalTypingTimer();
                                localTypingTimerRef.current = window.setTimeout(() => {
                                    try { if (peerId) void stopTyping(peerId); } catch { }
                                    localTypingTimerRef.current = null;
                                }, 1500);
                            }
                        }}
                        placeholder="Type a message..."
                    />
                    <Button size="sm" className="rounded-md" onClick={onSend} disabled={sending || !input.trim()}>
                        {sending ? "Sending…" : "Send"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
