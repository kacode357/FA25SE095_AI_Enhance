"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
    href: string;
    icon: React.ReactNode;
    label: string;
    value: number | string;
};

export default function MetricTile({ href, icon, label, value }: Props) {
    return (
        <Link
            href={href}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-2xl"
            aria-label={`${label}: ${value}. View details`}
        >
            <Card
                className="border card rounded-2xl transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: "var(--color-border)" }}
            >
                <CardContent className="p-4 md:p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div
                            className="size-9 md:size-10 grid place-items-center rounded-2xl border"
                            style={{
                                background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                                borderColor: "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                            }}
                        >
                            {icon}
                        </div>
                        <span className="text-sm truncate" style={{ color: "var(--color-muted)" }}>
                            {label}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                            {value}
                        </div>
                        <ChevronRight
                            className="size-5 opacity-60 transition-transform duration-150 group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
