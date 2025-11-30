"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NAV_ITEMS } from "./components/nav-items";

export default function LecturerProfileLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="px-4 md:px-8 lg:px-12 py-8">
            <header className="mb-6 flex flex-row justify-between">
                <div className="">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-nav">
                        Account Settings
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Manage your lecturer profile information and security.
                    </p>
                </div>
            </header>

            {/* Top navigation (no sidebar) */}
            <nav className="mb-6 border-b border-[var(--border)]">
                <ul className="-mb-px flex flex-wrap gap-2">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-sm font-medium transition-colors rounded-t-md
                    ${active
                                            ? "border-brand text-nav bg-[var(--card)]"
                                            : "border-transparent text-foreground/70 hover:text-nav-active hover:bg-[var(--card)]"}
                  `}
                                    aria-current={active ? "page" : undefined}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <main>{children}</main>
        </div>
    );
}
