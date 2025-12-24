"use client";

import { useChatDeleteMessage } from "@/hooks/chat/useChatDeleteMessage";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { buildChatTimeline, ChatTimelineItem, parseServerDate } from "@/utils/chat/time";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UseSupportRequestChatParams = {
    courseId: string;
    currentUserId: string | null;
    peerId: string;
    peerName: string;
    initialConvId?: string | null;
    supportRequestId?: string;
    initialResolved?: boolean;
    onResolve?: (id?: string) => Promise<void> | void;
};

const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

export function useSupportRequestChat({
    courseId,
    currentUserId,
    peerId,
    peerName,
    initialConvId,
    supportRequestId,
    initialResolved = false,
    onResolve,
}: UseSupportRequestChatParams) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [started, setStarted] = useState(false);
    const sendingRef = useRef(false);

    const messagesRef = useRef<HTMLDivElement | null>(null);
    const messageElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const shouldAutoScrollRef = useRef(true);

    const pendingRef = useRef(
        new Map<string, { createdAt: number; message: string; receiverId: string }>(),
    );
    const recentSendsRef = useRef(new Map<string, number>());

    const { getConversations } = useGetConversations();
    const { getConversationMessages } = useGetConversationMessages();
    const [conversationId, setConversationId] = useState<string | null>(
        initialConvId ?? null,
    );

    const tokenProvider = useCallback(() => getSavedAccessToken() || "", []);

    const search = useSearchParams();
    const querySupportRequestId =
        (search?.get("supportRequestId") as string | null) ??
        (search?.get("requestId") as string | null) ??
        undefined;

    // Gộp & khử trùng lặp tin nhắn từ Hub; xóa bản tạm khi bản thật về
    const handleReceiveMessagesBatch = useCallback((batch: ChatMessage[] | undefined) => {
        if (!batch?.length) return;

        setMessages((prev) => {
            const tempIdsToDelete = new Set<string>();

            batch.forEach((serverMsg) => {
                // Bỏ qua system messages khi khử tạm
                const isSystem = serverMsg.senderId === "system";
                if (isSystem) return;

                const serverText = (serverMsg.message || "").trim();
                const serverTime = parseServerDate(serverMsg.sentAt).getTime();

                // 1) Ưu tiên khớp theo pendingRef (độ chính xác cao hơn)
                let matchedTempId: string | null = null;
                for (const [tempId, meta] of pendingRef.current.entries()) {
                    const sameText = (meta.message || "").trim() === serverText;
                    // cửa sổ 30s kể từ khi tạo tin tạm
                    const withinWindow = Math.abs((serverTime || Date.now()) - meta.createdAt) <= 30_000;
                    if (sameText && withinWindow) {
                        matchedTempId = tempId;
                        break;
                    }
                }

                // 2) Nếu chưa khớp bằng pendingRef, fallback tìm theo prev list
                if (!matchedTempId) {
                    const matchingPrev = prev.find((p) => p.id.startsWith("temp-") && (p.message || "").trim() === serverText);
                    if (matchingPrev) matchedTempId = matchingPrev.id;
                }

                if (matchedTempId) {
                    tempIdsToDelete.add(matchedTempId);
                    pendingRef.current.delete(matchedTempId);
                }
            });

            const prevFiltered = prev.filter((m) => !tempIdsToDelete.has(m.id));
            const all = [...prevFiltered, ...batch];
            const unique = new Map<string, ChatMessage>();
            for (const m of all) unique.set(m.id, m);

            const next = Array.from(unique.values()).sort(
                (a, b) => parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime(),
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
            if (payload.userId !== peerId) return;
            if (payload.isTyping) {
                setPeerTyping(true);
                clearTypingSignalTimer();
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

    // --- Lấy thêm biến 'connected' từ hook ---
    const { connect, disconnect, sendMessage, startTyping, stopTyping, connected } = useChatHub({
        getAccessToken: tokenProvider,
        onReceiveMessagesBatch: handleReceiveMessagesBatch,
        onTyping: handleTyping,
    });

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
                }
            }
        } finally {
            setResolved(true);
            setResolving(false);
        }
    }, [onResolve, supportRequestId, resolved]);

    const scrollMessageIntoView = useCallback((id: string) => {
        try {
            const el = messageElsRef.current.get(id);
            if (!el) return;
            el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        } catch (e) {
            try {
                const elc = messagesRef.current;
                if (elc) elc.scrollTo({ top: elc.scrollHeight, behavior: "smooth" });
            } catch {
                
            }
        }
    }, []);

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

            setTimeout(() => {
                try {
                    scrollMessageIntoView(msg.id);
                } catch {
                    const el = messagesRef.current;
                    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
                }
            }, 40);
        } catch {
            
        }
    }, [peerId, peerName, scrollMessageIntoView]);

    const prevNonEmptyRef = useRef(false);
    useEffect(() => {
        if (!peerId) return;
        const nonEmpty = !!input.trim();

        if (!prevNonEmptyRef.current && nonEmpty) {
            try {
                void startTyping(peerId);
            } catch {
                
            }
        }

        if (prevNonEmptyRef.current && !nonEmpty) {
            try {
                void stopTyping(peerId);
            } catch {
                
            }
        }

        prevNonEmptyRef.current = nonEmpty;

        return () => {
            if (prevNonEmptyRef.current && peerId) {
                try {
                    void stopTyping(peerId);
                } catch {
                    
                }
            }
            prevNonEmptyRef.current = false;
        };
    }, [input, peerId, startTyping, stopTyping]);

    useEffect(() => {
        if (!started) return;
        let cancelled = false;
        (async () => {
            try {
                let convId = conversationId;

                if (!convId) {
                    const convs: any = await getConversations({ courseId });
                    const list = Array.isArray(convs) ? convs : convs?.conversations ?? [];
                    const conv =
                        list.find((c: any) => c.otherUserId === peerId && c.courseId === courseId) ?? null;
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
                const msgs: ChatMessage[] = Array.isArray(raw) ? raw : raw?.messages ?? [];
                if (!cancelled)
                    setMessages(
                        msgs.sort(
                            (a: ChatMessage, b: ChatMessage) =>
                                parseServerDate(a.sentAt).getTime() - parseServerDate(b.sentAt).getTime(),
                        ),
                    );
            } catch (e) {
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [started, courseId, peerId, conversationId]);

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

    useEffect(() => {
        const t = setTimeout(() => setStarted(true), 80);
        return () => clearTimeout(t);
    }, []);

    // --- FIX 2: onSend AN TOÀN (Fix lỗi "Not connected") ---
    const onSend = useCallback(async () => {
        if (!peerId || !courseId || !currentUserId) return;
        if (sendingRef.current) return;
        const message = input.trim();
        if (!message) return;

        // Auto-reconnect nếu chưa kết nối
        if (!connected) {
            console.log("Chat not connected, attempting to reconnect...");
            try {
                sendingRef.current = true; // Block UI tạm thời
                setSending(true);
                await connect();
            } catch (e) {
                console.error("Failed to reconnect before sending", e);
                setSending(false);
                sendingRef.current = false;
                return; // Dừng lại nếu không thể kết nối
            }
        }

        const sig = `${courseId}|${peerId}|${message}`;
        const now = Date.now();
        const last = recentSendsRef.current.get(sig) ?? 0;
        if (now - last < 5000) {
            console.warn("chat:onSend - duplicate blocked", { sig, last, now });
            // Vẫn cho phép UI unlock
            sendingRef.current = false;
            setSending(false);
            return;
        }
        recentSendsRef.current.set(sig, now);
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
            sendingRef.current = true;
            setSending(true);
            const effectiveSupportRequestId = supportRequestId ?? querySupportRequestId ?? undefined;
            const dto: SendMessagePayload = { courseId, receiverId: peerId, message, supportRequestId: effectiveSupportRequestId };
            
            // Giờ thì an toàn để gọi sendMessage
            await sendMessage(dto);
            setInput("");
        } catch (e) {
            // Xử lý lỗi nếu vẫn fail (ví dụ mất mạng ngay lúc gửi)
            console.error(e);
            // Có thể thêm logic xóa tin nhắn temp nếu muốn (optional)
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    }, [peerId, courseId, currentUserId, input, peerName, sendMessage, supportRequestId, querySupportRequestId, connected, connect]); 
    // ^ Nhớ thêm connected và connect vào dependency array

    const timeline = useMemo<ChatTimelineItem<ChatMessage>[]>(() => buildChatTimeline(messages, currentUserId), [messages, currentUserId]);

    const { requestDelete, ConfirmDialog } = useChatDeleteMessage({ currentUserId, setMessages });

    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom > 200) {
            shouldAutoScrollRef.current = false;
            return;
        }
        shouldAutoScrollRef.current = true;
        const t = setTimeout(() => {
            try {
                el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            } catch {
                el.scrollTop = el.scrollHeight;
            }
        }, 30);
        return () => clearTimeout(t);
    }, [messages]);

    const onMessagesScroll = useCallback(() => {
        const el = messagesRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        shouldAutoScrollRef.current = distanceFromBottom <= 200;
    }, []);

    useEffect(() => {
        return () => {
            clearTypingSignalTimer();
            if (peerId) {
                try {
                    void stopTyping(peerId);
                } catch {
                }
            }
        };
    }, []);

    return {
        messages,
        setMessages,
        input,
        setInput,
        sending,
        onSend,
        peerTyping,
        resolved,
        resolving,
        handleMarkResolved,
        handleQuickSend,
        timeline,
        messagesRef,
        messageElsRef,
        onMessagesScroll,
        scrollMessageIntoView,
        requestDelete,
        ConfirmDialog,
        peerName,
        peerId,
    } as const;
}