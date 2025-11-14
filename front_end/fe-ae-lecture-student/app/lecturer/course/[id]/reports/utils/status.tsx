"use client";


// Reusable mapping and badge component for report statuses
export const STATUS_MAP: Record<number, { label: string; classes: string }> = {
    1: { label: "Draft", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800" },
    2: { label: "Submitted", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" },
    3: { label: "Under review", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" },
    4: { label: "Requires revision", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800" },
    5: { label: "Resubmitted", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800" },
    6: { label: "Graded", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" },
    7: { label: "Late", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" },
    8: { label: "Rejected", classes: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800" },
};

export default function StatusBadge({ status }: { status?: number | string | null }) {
    const key = typeof status === "number" ? status : Number(status);
    const info = STATUS_MAP[key];
    if (!info) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                Unknown
            </span>
        );
    }
    return <span className={info.classes}>{info.label}</span>;
}
