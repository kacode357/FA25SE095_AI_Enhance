"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/join-class", label: "Tham gia lớp" },
  { href: "/assignments", label: "Bài tập" },
  { href: "/grades", label: "Điểm & Feedback" },
  { href: "/deadlines", label: "Hạn nộp" },
  { href: "/submissions", label: "Trạng thái nộp" },
  { href: "/notifications", label: "Thông báo" },
  { href: "/chat", label: "Chat" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar border-r hidden md:block">
      <div className="p-3">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block px-3 py-2 rounded-md text-sm ${active ? "bg-black text-white" : "hover:bg-black/5"}`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
