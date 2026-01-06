import React from "react";

export const Badge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-100 text-slate-600 border-slate-200"
        }`}>
        {active ? "Active" : "Inactive"}
    </span>
);

export default Badge;
