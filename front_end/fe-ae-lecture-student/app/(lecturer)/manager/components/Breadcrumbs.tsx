"use client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex items-center gap-2 text-sm text-slate-600">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-emerald-700 hover:underline underline-offset-2"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 font-medium">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <ChevronRight className="size-4 text-slate-400" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
