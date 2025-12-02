"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { parseServerDate, timeHHmm } from "@/utils/chat/time";
import React, { useState } from "react";

const cx = (...a: Array<string | false | undefined>) =>
    a.filter(Boolean).join(" ");

export default function ChatList({
    listRef,
    loadingHistory,
    timeline,
    openMenuId,
    setOpenMenuId,
    setConfirmId,
    deleting,
}: any) {
    const [hoverInfo, setHoverInfo] = useState< { id: string; label: string } | null>(null);

    return (
        <div
            ref={listRef}
            className="relative flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-stable pb-32"
        >
            {/* Loading skeleton */}
            {loadingHistory && (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className={cx(
                                "flex",
                                i % 2 === 0 ? "justify-start" : "justify-end",
                            )}
                        >
                            <div className="max-w-[75%] rounded-2xl px-3 py-2">
                                <Skeleton className="h-4 w-32 mb-1 rounded-full" />
                                <Skeleton className="h-4 w-40 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loadingHistory && timeline.length === 0 && (
                <div className="text-xs text-[var(--text-muted)]">No messages yet. Say hi!</div>
            )}

            {!loadingHistory &&
                timeline.map((it: any) => {
                    if (it.kind === "sep") {
                        return (
                            <div key={it.id} className="w-full flex items-center">
                                <div className="flex-1 h-px bg-[var(--border)]/100" />
                                <div className="mx-3 px-3 py-1 bg-[var(--card)] text-xs text-[var(--text-muted)] rounded-full border border-[var(--border)]">
                                    {it.label}
                                </div>
                                <div className="flex-1 h-px bg-[var(--border)]/100" />
                            </div>
                        );
                    }

                    const m = it.m;
                    const isMine = it.isMine;

                    return (
                        <div
                            key={m.id}
                            className={cx(
                                "flex",
                                isMine ? "justify-end" : "justify-start",
                            )}
                        >
                            <div
                                className={cx(
                                    "group relative w-fit max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                                    isMine
                                        ? "bg-[var(--brand)] text-white"
                                        : "bg-white border border-[var(--border)] text-slate-900",
                                )}
                                onMouseEnter={(e: React.MouseEvent) => {
                                    if (!listRef?.current) return;
                                    const rect = listRef.current.getBoundingClientRect();
                                    const x = (e as any).clientX - rect.left;
                                    const y = (e as any).clientY - rect.top + (listRef.current?.scrollTop ?? 0);
                                    const ts = parseServerDate(m.sentAt);
                                    if (Number.isNaN(ts.getTime())) return;
                                    const label = timeHHmm(ts);
                                    listRef.current.style.setProperty("--tooltip-left", `${x}px`);
                                    listRef.current.style.setProperty("--tooltip-top", `${y}px`);
                                    setHoverInfo({ id: m.id, label });
                                }}
                                onMouseMove={(e: React.MouseEvent) => {
                                    if (!hoverInfo || hoverInfo.id !== m.id) return;
                                    if (!listRef?.current) return;
                                    const rect = listRef.current.getBoundingClientRect();
                                    const x = (e as any).clientX - rect.left;
                                    const y = (e as any).clientY - rect.top + (listRef.current?.scrollTop ?? 0);
                                    listRef.current.style.setProperty("--tooltip-left", `${x}px`);
                                    listRef.current.style.setProperty("--tooltip-top", `${y}px`);
                                }}
                                onMouseLeave={() => setHoverInfo(null)}
                            >
                                {/* ⋮ menu */}
                                {isMine && !m.isDeleted && (
                                    <div className="absolute left-[-30px] top-1/2 -translate-y-1/2">
                                        <button
                                            data-trigger-id={m.id}
                                            className={cx(
                                                "flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-white text-[11px] text-slate-700 transition-opacity shadow-sm",
                                                openMenuId === m.id
                                                    ? "opacity-100"
                                                    : "opacity-0 group-hover:opacity-100",
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId((id: string | null) =>
                                                    id === m.id ? null : m.id,
                                                );
                                            }}
                                            aria-label="Message actions"
                                            aria-expanded={openMenuId === m.id ? "true" : "false"}
                                            title="More"
                                        >
                                            ⋮
                                        </button>

                                        {openMenuId === m.id && (
                                            <div
                                                data-menu-id={m.id}
                                                className="absolute cursor-pointer top-full right-0 z-50 mt-2 w-24 text-center justify-center rounded-lg hover:bg-red-600 border border-[var(--border)] bg-white py-1 text-xs text-slate-700 shadow-xl"
                                            >
                                                <button
                                                    className="w-full px-3 py-1.5 text-left cursor-pointer hover:text-white hover:bg-red-600 hover:rounded-lg"
                                                    disabled={deleting}
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setConfirmId(m.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div
                                    className={cx(
                                        "whitespace-pre-wrap break-words",
                                        m.isDeleted && "italic opacity-70",
                                    )}
                                >
                                    {m.message}
                                </div>
                            </div>
                        </div>
                    );
                })}

            {/* Hover tooltip positioned inside listRef */}
            {hoverInfo && (
                <div
                    className="pointer-events-none absolute z-50 left-[var(--tooltip-left)] top-[var(--tooltip-top)]"
                >
                    <div className="bg-white border border-[var(--border)] text-xs rounded px-2 py-1 shadow-sm">
                        {hoverInfo.label}
                    </div>
                </div>
            )}
        </div>
    );
}
