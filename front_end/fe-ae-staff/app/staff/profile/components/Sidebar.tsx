"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0">
      <nav
        className="card p-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition border
                  ${isActive
                    ? "bg-[color:color-mix(in_oklab,var(--color-brand)_14%,white)] border-[color:color-mix(in_oklab,var(--color-brand)_40%,white)]"
                    : "hover:bg-[color:color-mix(in_oklab,var(--color-brand)_8%,white)] border-transparent"
                  }`}
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"
                    style={{
                      color: "var(--color-brand-700)",
                      borderColor:
                        "color-mix(in oklab, var(--color-brand) 35%, var(--color-border))",
                      background:
                        "color-mix(in oklab, var(--color-brand) 10%, white)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-slate-800">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
