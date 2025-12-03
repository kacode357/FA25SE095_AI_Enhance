"use client";

import React from "react";

export function Panel({
    title,
    right,
    children,
}: {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-base md:text-lg font-semibold text-[#0A0F66] tracking-tight">{title}</h2>
                {right}
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}

export default Panel;
