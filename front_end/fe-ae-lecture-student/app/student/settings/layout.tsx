"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NAV_ITEMS } from "./components/nav-items";

export default function LecturerProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background px-4 py-4 md:px-8 lg:px-12">
      {/* Grid 2/8: aside 2 cột, content 8 cột, cao bám theo children */}
      <div className="grid grid-cols-10 gap-6 items-stretch">
        {/* Sidebar nav */}
        <aside className="col-span-10 md:col-span-2">
          <nav className="h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
                        ${
                          active
                            ? "bg-brand/10 text-nav font-semibold border border-brand/60"
                            : "text-foreground/80 hover:bg-slate-50 hover:text-nav"
                        }
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="col-span-10 md:col-span-8">{children}</main>
      </div>
    </div>
  );
}
