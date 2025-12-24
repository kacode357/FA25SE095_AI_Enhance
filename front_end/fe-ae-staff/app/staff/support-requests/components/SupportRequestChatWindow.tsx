"use client";

import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SupportRequestChatComposer from "./SupportRequestChatComposer";
import SupportRequestChatHeader from "./SupportRequestChatHeader";
import SupportRequestMessageList from "./SupportRequestMessageList";
import { useSupportRequestChat } from "./useSupportRequestChat";

type Props = {
    courseId: string;
    currentUserId: string | null;
    peerId: string;
    peerName: string;
    conversationId?: string | null;
    onClose?: () => void;
    supportRequestId?: string;
    isResolved?: boolean;
    onResolve?: (id?: string) => Promise<void> | void;
};

const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

export default function SupportRequestChatWindow({
    courseId,
    currentUserId,
    peerId,
    peerName,
    conversationId: initialConvId,
    supportRequestId,
    isResolved: initialResolved = false,
    onResolve,
}: Props) {
    const {
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
        requestDelete,
        ConfirmDialog,
        setMessages,
        scrollMessageIntoView,
    } = useSupportRequestChat({
        courseId,
        currentUserId,
        peerId,
        peerName,
        initialConvId,
        supportRequestId,
        initialResolved,
        onResolve,
    });

    const rootRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const footerRef = useRef<HTMLDivElement | null>(null);
    const [footerHeight, setFooterHeight] = useState(0);
    const [footerRect, setFooterRect] = useState<{ left: number; width: number } | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [headerRect, setHeaderRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const router = useRouter();

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
        }

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", scheduleRecompute);
            try {
                if (ro) ro.disconnect();
            } catch {
            }
        };
    }, []);

    return (
        <div ref={rootRef} className="w-full h-full flex flex-col">
            <div
                ref={headerRef}
                className="flex-none bg-[var(--card)] border-b border-[var(--border)] z-30 flex flex-col justify-center px-4 py-3 shadow-sm"
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
                <SupportRequestChatHeader
                    peerName={peerName}
                    resolved={resolved}
                    resolving={resolving}
                    onResolve={handleMarkResolved}
                    supportRequestId={supportRequestId}
                    onQuickSend={handleQuickSend}
                />

            </div>

            <SupportRequestMessageList
                timeline={timeline as any}
                isResolved={resolved}
                peerName={peerName}
                peerTyping={peerTyping}
                headerHeight={headerHeight}
                footerHeight={footerHeight}
                onMessagesScroll={onMessagesScroll}
                messagesRef={messagesRef}
                messageElsRef={messageElsRef}
                requestDelete={requestDelete}
                onConfirmResolve={async () => {
                    try {
                        await handleMarkResolved();
                    } catch {

                    }
                    try {
                        const ack: ChatMessage = {
                            id: uuid(),
                            senderId: "system",
                            senderName: "System",
                            receiverId: peerId,
                            receiverName: peerName,
                            message: "Thanks - we've marked this request as resolved.",
                            sentAt: new Date().toISOString(),
                            isDeleted: false,
                        } as unknown as ChatMessage;
                        setMessages((prev) => {
                            const next = [...prev, ack];
                            return next.length > 500 ? next.slice(-500) : next;
                        });
                        setTimeout(() => {
                            try {
                                scrollMessageIntoView(ack.id);
                            } catch {

                            }
                        }, 60);
                    } catch {

                    }
                }}
            />

            {ConfirmDialog}
            {/* footer is visually inside the chat container but fixed to viewport bottom */}
            <div
                ref={footerRef}
                className="flex-none px-4 py-3 bg-[var(--card)] border-t border-[var(--border)] z-40 shadow-sm"
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
                <SupportRequestChatComposer
                    input={input}
                    setInput={(v) => setInput(v)}
                    onSend={onSend}
                    sending={sending}
                />
            </div>
        </div>
    );
}
