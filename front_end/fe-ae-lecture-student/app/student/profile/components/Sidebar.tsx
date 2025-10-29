// app/student/profile/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // Sidebar không cố định chiều cao, tự stretch theo main
    <aside className="w-full md:w-64 shrink-0 self-stretch">
      {/* Không dùng .card để giảm độ bo góc; vẫn border + shadow nhẹ */}
      <nav className="h-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-sm">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition border rounded-md
                    ${isActive ? "text-nav" : "text-foreground/90 hover:text-nav-active"}
                  `}
                  style={{
                    background: isActive
                      ? "color-mix(in oklab, var(--brand) 12%, var(--white))"
                      : undefined,
                    borderColor: isActive
                      ? "color-mix(in oklab, var(--brand) 40%, var(--border))"
                      : "transparent",
                  }}
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                    style={{
                      color: "var(--brand-700)",
                      borderColor: "color-mix(in oklab, var(--brand) 35%, var(--border))",
                      background: "color-mix(in oklab, var(--brand) 10%, var(--white))",
                    }}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
