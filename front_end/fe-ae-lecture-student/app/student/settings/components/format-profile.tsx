import { BadgeCheck } from "lucide-react";

export function StatLine({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-white p-3">
            <div className="text-sm gap-2 flex items-center text-nav font-medium">
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

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-white px-3 py-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] flex items-center gap-1">
                {label}
            </div>
            <div className="text-sm text-foreground text-right break-all">{value || <span className="text-slate-400 italic">Not set</span>}</div>
        </div>
    );
}

export function Badge({ label, tone = "neutral", compact = false }: { label: string; tone?: "brand" | "success" | "neutral"; compact?: boolean }) {
    const toneClass =
        tone === "brand"
            ? "bg-[color:oklch(0.95_0.02_250)] text-[var(--brand-700)] border-[color:oklch(0.9_0.02_250)]"
            : tone === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-slate-50 text-slate-700 border-slate-200";
    return (
        <span
            className={`inline-flex items-center rounded-full border ${compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"} font-medium ${toneClass}`}
        >
            <BadgeCheck className="w-3.5 h-3.5 mr-1" />
            {label}
        </span>
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
    if (!iso) return <span className="text-slate-400 italic">Not updated yet</span>;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return <span className="text-slate-400 italic">Not updated yet</span>;
    const opts: Intl.DateTimeFormatOptions = dateOnly
        ? { year: "numeric", month: "short", day: "2-digit" }
        : { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    return new Intl.DateTimeFormat(undefined, opts).format(d);
}
