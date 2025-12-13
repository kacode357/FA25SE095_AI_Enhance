"use client";

import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";
import { parseServerDate, timeHHmm } from "@/utils/chat/time";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SupportRequestResolvePrompt from "./SupportRequestResolvePrompt";

export type SepItem = { kind: "sep"; id: string; label: string };
export type MsgItem = {
    kind: "msg";
    id: string;
    m: ChatMessage;
    isMine: boolean;
};

export type TimelineItem = SepItem | MsgItem;

type Props = {
    timeline: TimelineItem[];
    isResolved: boolean;
    peerName: string;
    peerTyping: boolean;
    headerHeight: number;
    footerHeight: number;
    onMessagesScroll: () => void;
    messagesRef: React.MutableRefObject<HTMLDivElement | null>;
    messageElsRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
    requestDelete: (messageId: string) => void;
    onConfirmResolve: () => Promise<void> | void;
};

export default function SupportRequestMessageList({
    timeline,
    isResolved,
    peerName,
    peerTyping,
    headerHeight,
    footerHeight,
    onMessagesScroll,
    messagesRef,
    messageElsRef,
    requestDelete,
    onConfirmResolve,
}: Props) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [hoverPos, setHoverPos] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const inMenu = target.closest('[data-menu-owner]');
            const inButton = target.closest('[data-menu-button]');
            if (!inMenu && !inButton) setOpenMenuId(null);
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const hasMessages = useMemo(() => timeline.some((t) => t.kind === "msg"), [timeline]);

    return (
        <div
            ref={messagesRef as any}
            onScroll={onMessagesScroll}
            className="flex-1 overflow-y-auto space-y-4 bg-[linear-gradient(transparent,transparent)]"
            style={{
                paddingTop: headerHeight ? headerHeight + 12 : undefined,
                paddingBottom: footerHeight ? footerHeight + 20 : undefined,
            }}
        >
            {timeline.length === 0 || !hasMessages ? (
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
                            className={`flex w-full ${isSystem ? "justify-center" : isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className="relative flex items-center gap-2 justify-center group"
                                onMouseEnter={() => setHoverPos({ id: m.id, x: 0, y: 0 })}
                                onMouseMove={(e) => setHoverPos({ id: m.id, x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setHoverPos({ id: null, x: 0, y: 0 })}
                            >
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

                                        <div
                                            data-menu-owner={m.id}
                                            className={`absolute -left-12 -top-2 bg-white border-slate-100 border shadow-md rounded-md p-1 z-50 transition-transform ${openMenuId === m.id ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"}`}
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

                                {isSystem && !isResolved && typeof m.message === "string" && m.message.includes("Has your need been resolved") ? (
                                    <SupportRequestResolvePrompt
                                        message={m.message}
                                        onDismiss={() => { }}
                                        onConfirm={async () => {
                                            try {
                                                await onConfirmResolve();
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
                                                    ? "bg-gradient-to-br from-green-300 to-green-500 text-white shadow-md max-w-[70vw] mr-6"
                                                    : "bg-white max-w-[70vw] min-w-0 break-words shadow-sm ml-6"
                                                }`
                                        }
                                    >
                                        {m.isDeleted ? <i className="opacity-70">[deleted]</i> : m.message}
                                    </div>
                                )}

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
                        </div>
                    );
                })
            )}

            {peerTyping && (
                <div className="px-6 pt-1 text-[11px] text-muted-foreground">{peerName || "User"} is typing…</div>
            )}
        </div>
    );
}
