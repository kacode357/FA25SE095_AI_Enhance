"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-full">
            <nav
                className="card py-2 px-5 mb-4"
                style={{ borderColor: "#e2e8f0", background: "var(--color-card)" }}
            >
                <ul className="flex gap-10 overflow-auto">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href);
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`inline-flex items-center gap-0 pt-2 pb-2 text-sm font-medium transition whitespace-nowrap border-b-2 ${isActive
                                        ? "border-violet-500 text-purple-600"
                                        : "border-transparent text-slate-800"
                                        }`}
                                >
                                    <span className="inline-flex h-6 w-6 items-center justify-start text-slate-500">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span>{label}</span>
                                </Link>

                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
