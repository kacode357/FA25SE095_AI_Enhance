"use client";

import Link from "next/link";
import { Megaphone, Bell, Info, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO string
  category?: "System" | "Course" | "Maintenance" | "General";
  linkHref?: string;
  linkLabel?: string;
};

// TODO: replace with API data
const announcements: Announcement[] = [
  // ví dụ (có thể xoá nếu cần)
  // {
  //   id: "1",
  //   title: "Planned maintenance on Saturday",
  //   body: "The system will be temporarily unavailable from 10:00 PM to 11:30 PM for scheduled maintenance.",
  //   createdAt: "2025-11-26T10:00:00Z",
  //   category: "Maintenance",
  // },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentHomePage() {
  const { user } = useAuth();

  const displayName =
    user?.firstName || user?.lastName || user?.email || "Student";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Welcome back
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-50">
            Hi, {displayName}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            This page shows important announcements and updates from the admin
            team.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
          <Megaphone className="h-4 w-4 text-slate-300" />
          <span>Admin announcements center</span>
        </div>
      </header>

      {/* Announcements list */}
      <section className="space-y-4">
        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
              <Bell className="h-5 w-5 text-slate-200" />
            </div>
            <h2 className="text-sm font-semibold text-slate-50">
              You&apos;re all caught up
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-400">
              There are no new announcements from the admin team. When there is
              something important about your account, courses, or the system,
              it will show up here.
            </p>
          </div>
        )}

        {announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((a) => (
              <article
                key={a.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
                      <Info className="h-4 w-4 text-slate-100" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-50">
                          {a.title}
                        </h2>
                        {a.category && (
                          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                            {a.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-300">{a.body}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="text-[11px] text-slate-500">
                      {formatDate(a.createdAt)}
                    </span>
                    {a.linkHref && a.linkLabel && (
                      <Link
                        href={a.linkHref}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-sky-300 hover:text-sky-200"
                      >
                        <span>{a.linkLabel}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
