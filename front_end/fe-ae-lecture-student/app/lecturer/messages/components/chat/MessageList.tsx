import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";
import React from "react";
import { dayLabel, mins, parseServerDate, sameDay, timeHHmm } from "./chatUtils";

type Props = {
    messages: ChatMessage[];
    currentUserId: string | null;
    listRef: React.RefObject<HTMLDivElement | null>;
    loadingHistory: boolean;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
    setConfirmId: (id: string | null) => void;
    typingText?: string;
};

const cx = (...a: Array<string | false | undefined>) => a.filter(Boolean).join(" ");

export default function MessageList({ messages, currentUserId, listRef, loadingHistory, openMenuId, setOpenMenuId, setConfirmId, typingText }: Props) {
    const rendered = React.useMemo(() => {
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

    return (
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
                                            setOpenMenuId(openMenuId === it.m.id ? null : it.m.id);
                                        }}
                                        type="button"
                                        aria-label="Message actions"
                                        aria-expanded={openMenuId === it.m.id ? "true" : "false"}
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
                                                type="button"
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
                ),
            )}

            {typingText && <div className="text-xs text-gray-500">{typingText}</div>}
        </div>
    );
}
