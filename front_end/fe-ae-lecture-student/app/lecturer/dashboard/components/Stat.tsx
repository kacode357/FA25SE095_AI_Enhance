"use client";

import React from "react";

export function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            {icon && <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon}</div>}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xl font-semibold text-gray-900">{value}</span>
            </div>
        </div>
    );
}

export default Stat;
