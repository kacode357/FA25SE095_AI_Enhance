"use client";

export function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <p className="flex justify-between">
            <span className="text-slate-500">{label}:</span>
            <span className={`font-medium text-slate-800 ${mono ? "font-mono tracking-tight" : ""}`}>{value}</span>
        </p>
    );
}

export function InfoV2({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase tracking-wide">{label}</span>
            <span className={`text-slate-800 font-medium ${mono ? "font-mono tracking-tight" : ""}`}>{value || "—"}</span>
        </div>
    );
}
