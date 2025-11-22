"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
import { ArrowLeft, EllipsisVertical, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import SupportRequestResolved from "./SupportRequestResolved";

type Props = {
    courseId: string;
    currentUserId: string | null;
    peerId: string;
    peerName: string;
    conversationId?: string | null;
    onClose?: () => void;
    // optional id of the support request associated with this chat
    supportRequestId?: string;
    // initial resolved flag; when true, UI will show resolved state
    isResolved?: boolean;
    // optional callback called when marking resolved (receives supportRequestId if available)
    onResolve?: (id?: string) => Promise<void> | void;
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
    supportRequestId,
    isResolved: initialResolved = false,
    onResolve,
}: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    // control when heavy work (REST + SignalR connect) starts so UI can render first
    const [started, setStarted] = useState(false);

    const pendingRef = useRef(
        new Map<string, { createdAt: number; message: string; receiverId: string }>(),
    );
    // recent sends to prevent duplicate send calls (signature -> timestamp)
    const recentSendsRef = useRef(new Map<string, number>());

    const { getConversations } = useGetConversations();
    const { getConversationMessages } = useGetConversationMessages();
    const { deleteMessage, loading: deleting } = useDeleteMessage();

    const [conversationId, setConversationId] = useState<string | null>(
        initialConvId ?? null,
    );

    const tokenProvider = useCallback(() => getSavedAccessToken() || "", []);

    const handleReceiveMessagesBatch = useCallback((batch: ChatMessage[] | undefined) => {
        if (!batch?.length) return;
        setMessages((prev) => {
            // use a signature set to avoid duplicates coming from multiple hub events
            const byId = new Map(prev.map((m) => [m.id, m]));
            const sigSet = new Set<string>();
            for (const m of prev) {
                const sig = `${m.senderId}|${m.receiverId}|${m.message}|${Math.round(
                    new Date(m.sentAt).getTime() / 1000,
                )}`;
                sigSet.add(sig);
            }

            for (const it of batch) {
                // compute signature for dedupe
                const sig = `${it.senderId}|${it.receiverId}|${it.message}|${Math.round(
                    new Date(it.sentAt).getTime() / 1000,
                )}`;

                // replace temp if possible
                let replacedTemp = false;
                for (const [tempId, p] of pendingRef.current) {
                    const within7s = Date.now() - p.createdAt <= 7000;
                    if (
                        within7s &&
                        p.receiverId === it.receiverId &&
                        p.message === it.message &&
                        byId.has(tempId)
                    ) {
                        // remove temp message and its signature
                        const temp = byId.get(tempId)!;
                        const tempSig = `${temp.senderId}|${temp.receiverId}|${temp.message}|${Math.round(
                            new Date(temp.sentAt).getTime() / 1000,
                        )}`;
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

            const next = Array.from(byId.values()).sort(
                (a, b) =>
                    parseServerDate(a.sentAt).getTime() -
                    parseServerDate(b.sentAt).getTime(),
            );
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

    const handleTyping = useCallback(
        (payload?: { userId: string; isTyping: boolean }) => {
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
        },
        [peerId, clearTypingSignalTimer],
    );

    const { connect, disconnect, sendMessage, startTyping, stopTyping } =
        useChatHub({
            getAccessToken: tokenProvider,
            onReceiveMessagesBatch: handleReceiveMessagesBatch,
            onTyping: handleTyping,
        });

    // resolved status for the associated support request (local state)
    const [resolved, setResolved] = useState<boolean>(!!initialResolved);
    const [resolving, setResolving] = useState(false);

    const handleMarkResolved = useCallback(async () => {
        if (resolved) return;
        setResolving(true);
        try {
            if (onResolve) {
                await onResolve(supportRequestId);
            } else if (supportRequestId) {
                try {
                    const svc = await import("@/services/support-request.services");
                    const fn = (svc as any)?.SupportRequestService?.resolveSupportRequest;
                    if (typeof fn === "function") {
                        await fn(supportRequestId);
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("resolve: failed to call service", e);
                }
            }
        } finally {
            setResolved(true);
            setResolving(false);
        }
    }, [onResolve, supportRequestId, resolved]);

    // ===== TYPING LOGIC (sửa lại gọn như page cũ) =====
    const prevNonEmptyRef = useRef(false);
    useEffect(() => {
        if (!peerId) return;
        const nonEmpty = !!input.trim();

        // from empty -> has text: startTyping
        if (!prevNonEmptyRef.current && nonEmpty) {
            try {
                void startTyping(peerId);
            } catch {
                // ignore
            }
        }

        // from has text -> empty: stopTyping
        if (prevNonEmptyRef.current && !nonEmpty) {
            try {
                void stopTyping(peerId);
            } catch {
                // ignore
            }
        }

        prevNonEmptyRef.current = nonEmpty;

        return () => {
            // cleanup khi unmount / đổi peerId
            if (prevNonEmptyRef.current && peerId) {
                try {
                    void stopTyping(peerId);
                } catch {
                    // ignore
                }
            }
            prevNonEmptyRef.current = false;
        };
    }, [input, peerId, startTyping, stopTyping]);

    // load conversation id & messages (deferred until UI shows)
    useEffect(() => {
        if (!started) return;
        let cancelled = false;
        (async () => {
            try {
                let convId = conversationId;

                if (!convId) {
                    const convs: any = await getConversations({ courseId });
                    const list = Array.isArray(convs)
                        ? convs
                        : convs?.conversations ?? [];
                    const conv =
                        list.find(
                            (c: any) =>
                                c.otherUserId === peerId && c.courseId === courseId,
                        ) ?? null;
                    if (conv) {
                        convId = conv.id;
                        setConversationId(conv.id);
                    } else {
                        setConversationId(null);
                    }
                }

                if (!convId) return;

                const raw: any = await getConversationMessages(convId, {
                    pageNumber: 1,
                    pageSize: 50,
                });
                const msgs: ChatMessage[] = Array.isArray(raw)
                    ? raw
                    : raw?.messages ?? [];
                if (!cancelled)
                    setMessages(
                        msgs.sort(
                            (a: ChatMessage, b: ChatMessage) =>
                                parseServerDate(a.sentAt).getTime() -
                                parseServerDate(b.sentAt).getTime(),
                        ),
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, courseId, peerId, conversationId]);

    // connect to hub after UI rendered (deferred)
    useEffect(() => {
        if (!started) return;

        let cancelled = false;

        (async () => {
            if (cancelled) return;

            try {
                await connect();
            } catch (e) {
                if (!cancelled) console.error("chat: connect error", e);
            }
        })();

        return () => {
            cancelled = true;
            disconnect().catch(() => { });
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

        pendingRef.current.set(tempId, {
            createdAt: Date.now(),
            message,
            receiverId: peerId,
        });
        setMessages((prev) => {
            const next = [...prev, local];
            return next.length > 500 ? next.slice(-500) : next;
        });

        try {
            setSending(true);
            const dto: SendMessagePayload = { courseId, receiverId: peerId, message };
            await sendMessage(dto);
            setInput("");
            // sau khi send thì coi như hết typing (input rỗng -> effect sẽ tự gọi stopTyping)
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
    const router = useRouter();

    // track which message's confirm dialog is open
    const [confirmId, setConfirmId] = useState<string | null>(null);

    // scroll to bottom when messages change, but only if the user is near bottom
    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;
        const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;
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
        const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;
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
            if (footer)
                setFooterHeight(Math.ceil(footer.getBoundingClientRect().height));
            if (footer) setFooterRect({ left: Math.max(r.left, 0), width: r.width });
            if (header)
                setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
            if (header)
                setHeaderRect({
                    top: Math.max(r.top, 0),
                    left: Math.max(r.left, 0),
                    width: r.width,
                });
        };

        recompute();
        let raf = 0;
        const scheduleRecompute = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(recompute);
        };

        // observe window resizes
        window.addEventListener("resize", scheduleRecompute);

        // Use ResizeObserver to detect layout changes (e.g. sidebar collapse)
        let ro: ResizeObserver | null = null;
        try {
            if (typeof ResizeObserver !== "undefined") {
                ro = new ResizeObserver(scheduleRecompute);
                if (rootRef.current) ro.observe(rootRef.current);
                if (footerRef.current) ro.observe(footerRef.current);
                if (headerRef.current) ro.observe(headerRef.current);
            }
        } catch (e) {
            // ignore if ResizeObserver not available
        }

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", scheduleRecompute);
            try {
                if (ro) ro.disconnect();
            } catch {
                // ignore
            }
        };
    }, []);

    // cleanup timers + typing signal from peer
    useEffect(() => {
        return () => {
            clearTypingSignalTimer();
            if (peerId) {
                try {
                    void stopTyping(peerId);
                } catch {
                    // ignore
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={rootRef} className="w-full h-full flex flex-col">
            <div
                ref={headerRef}
                className="flex-none bg-white z-30 flex flex-col justify-center px-4 py-3 shadow-lg"
                style={
                    headerRect
                        ? {
                            position: "fixed",
                            top: headerRect.top,
                            left: headerRect.left,
                            width: headerRect.width,
                        }
                        : {}
                }
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="cursor-pointer" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <h3 className="text-lg font-semibold">{peerName || "User"}</h3>
                    </div>
                    <SupportRequestResolved
                        resolved={resolved}
                        resolving={resolving}
                        onResolve={handleMarkResolved}
                        supportRequestId={supportRequestId}
                    />
                </div>

            </div>

            <div
                ref={messagesRef}
                onScroll={onMessagesScroll}
                className="flex-1 overflow-y-auto space-y-6 bg-[linear-gradient(transparent,transparent)]"
                style={{
                    paddingTop: headerHeight ? headerHeight + 12 : undefined,
                    paddingBottom: footerHeight ? footerHeight + 20 : undefined,
                }}
            >
                {rendered.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No messages yet.</div>
                ) : (
                    rendered.map((m) => {
                        const isMe = m.senderId === currentUserId;

                        return (
                            <div key={m.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className="relative flex items-center gap-2 justify-end">

                                    {/* Icon Ellipsis bên trái message của mình */}
                                    {isMe && (
                                        <div className="relative cursor-pointer group">
                                            <EllipsisVertical className="w-5 h-5 text-muted-foreground" />

                                            {/* Menu Delete positioned relative to the icon and shown only when hovering the icon */}
                                            <div className="absolute -left-12 -top-2 bg-white border-slate-100 border shadow-md rounded-md p-1 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition -translate-y-1 group-hover:translate-y-0">
                                                <button
                                                    className="px-3 py-1 text-sm cursor-pointer text-red-600 hover:bg-red-50 w-full text-left"
                                                    onClick={() => setConfirmId(m.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message bubble */}
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed inline-block whitespace-pre-wrap break-words ${isMe
                                            ? "bg-gradient-to-br from-pink-300 to-purple-500 text-white shadow-md max-w-[70vw] mr-6"
                                            : "bg-white max-w-[70vw] min-w-0 break-words shadow-sm ml-6"
                                            }`}
                                    >
                                        {m.isDeleted ? <i className="opacity-70">[deleted]</i> : m.message}

                                        {
                                            (() => {
                                                const d = new Date(m.sentAt);
                                                const formatted = !isNaN(d.getTime())
                                                    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
                                                    : "";
                                                return (
                                                    <div className={`text-[11px] mt-2 whitespace-nowrap ${isMe ? "text-white/80" : "text-muted-foreground"}`}>
                                                        {formatted}
                                                    </div>
                                                );
                                            })()
                                        }
                                    </div>


                                </div>

                                {/* Modal Confirm Delete */}
                                <AlertDialog
                                    open={confirmId === m.id}
                                    onOpenChange={(open) => !open && setConfirmId(null)}
                                >
                                    <AlertDialogContent className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white border border-gray-200 shadow-2xl">
                                        <AlertDialogTitle className="text-lg font-semibold">Delete message?</AlertDialogTitle>

                                        <AlertDialogDescription className="text-sm text-muted-foreground">
                                            This action cannot be undone.
                                        </AlertDialogDescription>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="cursor-pointer" onClick={() => setConfirmId(null)}>
                                                Cancel
                                            </AlertDialogCancel>

                                            <AlertDialogAction
                                                disabled={deleting}
                                                onClick={async () => {
                                                    try {
                                                        await deleteMessage(m.id);
                                                        setMessages(prev =>
                                                            prev.map(msg =>
                                                                msg.id === m.id ? { ...msg, isDeleted: true } : msg
                                                            )
                                                        );
                                                        toast.success("Message deleted successfully");
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error("Failed to delete message");
                                                    } finally {
                                                        setConfirmId(null);
                                                    }
                                                }}
                                                className="bg-red-600 shadow-lg cursor-pointer text-white hover:bg-red-700"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        );
                    })
                )}

                {/* typing indicator shown inside messages container (below messages) */}
                {peerTyping && (
                    <div className="px-6 pt-1 text-[11px] text-muted-foreground">
                        {peerName || "User"} is typing…
                    </div>
                )}
            </div>

            {/* footer is visually inside the chat container but fixed to viewport bottom */}
            <div
                ref={footerRef}
                className="flex-none px-4 py-3 bg-white z-40 shadow-md"
                style={
                    footerRect
                        ? {
                            position: "fixed",
                            bottom: 0,
                            left: footerRect.left,
                            width: footerRect.width,
                        }
                        : {}
                }
            >
                <div className="flex items-center gap-3">
                    <textarea
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm resize-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-slate-300"
                        rows={2}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void onSend();
                            }
                        }}
                        placeholder="Type a message..."
                    />
                    <Button
                        size="lg"
                        className="rounded-md btn btn-gradient-slow"
                        onClick={onSend}
                        disabled={sending || !input.trim()}
                    >
                        {sending ? "Sending…" : "Send"} <Send className="size-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
