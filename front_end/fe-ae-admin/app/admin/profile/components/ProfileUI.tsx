"use client";

import React from "react";

export function StatLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-white p-3">
            <div className="text-sm flex items-center text-nav font-medium gap-2">
                {label}: <span className="font-normal text-foreground/80">{value}</span>
            </div>
        </div>
    );
}

export function Field({
    label,
    children,
    span = 1,
    hint,
}: {
    label: string;
    children: React.ReactNode;
    span?: 1 | 2;
    hint?: string;
}) {
    return (
        <div className={span === 2 ? "md:col-span-2" : ""}>
            <label className="block text-sm text-nav mb-1">{label}</label>
            {children}
            {hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
        </div>
    );
}

export function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-white p-3">
            <div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
            <div className="text-sm text-foreground mt-0.5 break-all">{value || "-"}</div>
        </div>
    );
}

export function safeStr(v: unknown): string {
    return typeof v === "string" ? v : v == null ? "" : String(v);
}

export function initials(first?: string, last?: string) {
    const f = safeStr(first).trim();
    const l = safeStr(last).trim();
    return (f[0] || "").toUpperCase() + (l[0] || "").toUpperCase();
}

export function formatDateTime(iso?: string | null, dateOnly = false) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    const opts: Intl.DateTimeFormatOptions = dateOnly
        ? { year: "numeric", month: "short", day: "2-digit" }
        : { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    return new Intl.DateTimeFormat(undefined, opts).format(d);
}

export default {
    StatLine,
    Field,
    InfoItem,
    safeStr,
    initials,
    formatDateTime,
};
