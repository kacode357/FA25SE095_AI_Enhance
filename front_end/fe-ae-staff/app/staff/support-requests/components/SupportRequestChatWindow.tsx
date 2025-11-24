"use client";

import { Button } from "@/components/ui/button";
import { useChatDeleteMessage } from "@/hooks/chat/useChatDeleteMessage";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type {
    ChatMessageItemResponse as ChatMessage,
} from "@/types/chat/chat.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
// time helpers (shared)
import {
    buildChatTimeline,
    ChatTimelineItem,
    parseServerDate,
    timeHHmm,
} from "@/utils/chat/time";
import { ArrowLeft, EllipsisVertical, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SupportRequestResolved from "./SupportRequestResolved";
import SupportRequestResolvePrompt from "./SupportRequestResolvePrompt";

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

// parseServerDate is imported from shared utils (`@/utils/chat/time`)

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
    // which message's ellipsis menu is open
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    // hover position for tooltip (follows cursor)
    const [hoverPos, setHoverPos] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });

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

    // helper to scroll a particular message element into view (centers in container)
    const scrollMessageIntoView = useCallback((id: string) => {
        try {
            const el = messageElsRef.current.get(id);
            const container = messagesRef.current;
            if (!el || !container) return;
            // Prefer element-level scrollIntoView for nested scroll containers
            // attempt to center the element within the scroll container
            el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        } catch (e) {
            // fallback: scroll to bottom
            try {
                const elc = messagesRef.current;
                if (elc) elc.scrollTo({ top: elc.scrollHeight, behavior: "smooth" });
            } catch {
                // ignore
            }
        }
    }, []);

    // quick send a system message when user clicks the resolved prompt
    const handleQuickSend = useCallback(() => {
        try {
            const text = "Has your need been resolved?";
            const msg: ChatMessage = {
                id: uuid(),
                senderId: "system",
                senderName: "System",
                receiverId: peerId,
                receiverName: peerName,
                message: text,
                sentAt: new Date().toISOString(),
                isDeleted: false,
            } as unknown as ChatMessage;

            setMessages((prev) => {
                const next = [...prev, msg];
                return next.length > 500 ? next.slice(-500) : next;
            });

            // ensure we auto-scroll to the new system prompt message
            setTimeout(() => {
                try {
                    scrollMessageIntoView(msg.id);
                } catch {
                    // fallback to bottom
                    const el = messagesRef.current;
                    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
                }
            }, 40);
        } catch (e) {
            // ignore
        }
    }, [peerId, peerName, scrollMessageIntoView]);

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

    // close open menu when clicking outside
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            // if click inside a menu or the button for current open menu, keep it open
            const inMenu = target.closest('[data-menu-owner]');
            const inButton = target.closest('[data-menu-button]');
            if (!inMenu && !inButton) setOpenMenuId(null);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
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
            const dto: SendMessagePayload = { courseId, receiverId: peerId, message, supportRequestId };
            await sendMessage(dto);
            setInput("");
            // sau khi send thì coi như hết typing (input rỗng -> effect sẽ tự gọi stopTyping)
        } finally {
            setSending(false);
        }
    };

    // build timeline items (separators + messages with showTime flag)
    const timeline = useMemo<ChatTimelineItem<ChatMessage>[]>(() =>
        buildChatTimeline(messages, currentUserId),
        [messages, currentUserId],
    );
    const rootRef = useRef<HTMLDivElement | null>(null);
    const messagesRef = useRef<HTMLDivElement | null>(null);
    const messageElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const footerRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const shouldAutoScrollRef = useRef(true);
    const [footerHeight, setFooterHeight] = useState(0);
    const [footerRect, setFooterRect] = useState<{ left: number; width: number } | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [headerRect, setHeaderRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const router = useRouter();

    // hook to handle message deletion + confirm dialog
    const { requestDelete, ConfirmDialog } = useChatDeleteMessage({
        currentUserId,
        setMessages,
    });

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
                        onQuickSend={handleQuickSend}
                    />
                </div>

            </div>

            <div
                ref={messagesRef}
                onScroll={onMessagesScroll}
                className="flex-1 overflow-y-auto space-y-4 bg-[linear-gradient(transparent,transparent)]"
                style={{
                    paddingTop: headerHeight ? headerHeight + 12 : undefined,
                    paddingBottom: footerHeight ? footerHeight + 20 : undefined,
                }}
            >
                {timeline.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No messages yet.</div>
                ) : (
                    timeline.map((it) => {
                        if (it.kind === "sep") {
                            return (
                                <div key={it.id} className="w-full flex items-center py-3">
                                    <div className="flex-1 border-t border-slate-200" />
                                    <div className="mx-3 px-3 py-1 bg-white rounded-full text-xs text-muted-foreground shadow-sm">
                                        {it.label}
                                    </div>
                                    <div className="flex-1 border-t border-slate-200" />
                                </div>
                            );
                        }

                        const m = it.m;
                        const isMe = it.isMine;
                        const isSystem = m.senderId === "system" || (m as any).isSystem;
                        const d = parseServerDate(m.sentAt);
                        const formatted = !isNaN(d.getTime()) ? timeHHmm(d) : "";

                        return (
                            <div
                                key={m.id}
                                ref={(el) => {
                                    if (el) messageElsRef.current.set(m.id, el);
                                    else messageElsRef.current.delete(m.id);
                                }}
                                className={`flex w-full ${isSystem ? "justify-center" : isMe ? "justify-end" : "justify-start"}`}>
                                <div
                                    className="relative flex items-center gap-2 justify-center group"
                                    onMouseEnter={() => setHoverPos({ id: m.id, x: 0, y: 0 })}
                                    onMouseMove={(e) => setHoverPos({ id: m.id, x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => setHoverPos({ id: null, x: 0, y: 0 })}
                                >

                                    {/* Icon Ellipsis bên trái message của mình */}
                                    {isMe && (
                                        <div className="relative">
                                            <button
                                                title="Button"
                                                data-menu-button={m.id}
                                                type="button"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    setOpenMenuId((cur) => (cur === m.id ? null : m.id));
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                                            >
                                                <EllipsisVertical className="w-4 h-4 text-muted-foreground" />
                                            </button>

                                            {/* Menu Delete shown only when ellipsis is clicked (openMenuId matches) */}
                                            <div
                                                data-menu-owner={m.id}
                                                className={`absolute -left-12 -top-2 bg-white border-slate-100 border shadow-md rounded-md p-1 z-50 transition-transform ${openMenuId === m.id ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'}`}
                                            >
                                                <button
                                                    className="px-3 py-1 text-sm cursor-pointer text-red-600 hover:bg-red-50 w-full text-left"
                                                    onClick={(ev) => {
                                                        ev.stopPropagation();
                                                        setOpenMenuId(null);
                                                        requestDelete(m.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message bubble */}
                                    {isSystem && !resolved && typeof m.message === 'string' && m.message.includes('Has your need been resolved') ? (
                                        <SupportRequestResolvePrompt
                                            message={m.message}
                                            onDismiss={() => {
                                                // optional: add a small system note or just close
                                            }}
                                            onConfirm={async () => {
                                                try {
                                                    await handleMarkResolved();
                                                } catch (e) {
                                                    // ignore
                                                }

                                                // add a short acknowledgement system message
                                                try {
                                                    const ack: ChatMessage = {
                                                        id: uuid(),
                                                        senderId: "system",
                                                        senderName: "System",
                                                        receiverId: peerId,
                                                        receiverName: peerName,
                                                        message: "Thanks — we've marked this request as resolved.",
                                                        sentAt: new Date().toISOString(),
                                                        isDeleted: false,
                                                    } as unknown as ChatMessage;
                                                    setMessages((prev) => {
                                                        const next = [...prev, ack];
                                                        return next.length > 500 ? next.slice(-500) : next;
                                                    });
                                                    // ensure the acknowledgement (and original prompt) are visible
                                                    setTimeout(() => {
                                                        try {
                                                            scrollMessageIntoView(ack.id);
                                                        } catch {
                                                            try {
                                                                scrollMessageIntoView(m.id);
                                                            } catch {
                                                                // ignore
                                                            }
                                                        }
                                                    }, 60);
                                                } catch {
                                                    // ignore
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className={
                                                isSystem
                                                    ? "rounded-full px-4 py-2 text-sm leading-relaxed inline-block whitespace-pre-wrap text-muted-foreground bg-slate-100 shadow-sm max-w-[70%] text-center"
                                                    : `rounded-2xl px-4 py-3 text-sm leading-relaxed inline-block whitespace-pre-wrap break-words ${isMe
                                                        ? "bg-gradient-to-br from-pink-300 to-purple-500 text-white shadow-md max-w-[70vw] mr-6"
                                                        : "bg-white max-w-[70vw] min-w-0 break-words shadow-sm ml-6"
                                                    }`
                                            }
                                        >
                                            {m.isDeleted ? <i className="opacity-70">[deleted]</i> : m.message}
                                        </div>
                                    )}

                                    {/* Floating timestamp tooltip that follows cursor when hovering this message */}
                                    <div>
                                        {hoverPos.id === m.id && (
                                            <div
                                                style={{ left: hoverPos.x + 12, top: hoverPos.y + 12, position: "fixed", pointerEvents: "none", zIndex: 60 }}
                                            >
                                                <div className="bg-white border border-slate-100 shadow-sm rounded-md px-3 py-1 text-xs text-muted-foreground">
                                                    {formatted}
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                </div>

                                {/* Confirm dialog is rendered by the deletion hook (once) */}
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

            {ConfirmDialog}
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
