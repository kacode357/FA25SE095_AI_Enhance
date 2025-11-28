// app/student/announcements/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAnnouncementDetail } from "@/hooks/announcements/useAnnouncementDetail";
import type { AnnouncementItem } from "@/types/announcements/announcement.response";

import { parseServerDate, dayLabel, timeHHmm } from "@/utils/chat/time";
import LiteRichTextEditor from "@/components/common/TinyMCE";

function formatAudience(audience: AnnouncementItem["audience"]) {
  switch (audience) {
    case 0:
      return "All users";
    case 1:
      return "Students";
    case 2:
      return "Lecturers";
    default:
      return "Unknown";
  }
}

function formatTime(ts?: string) {
  if (!ts) return "";
  const d = parseServerDate(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${dayLabel(d)} • ${timeHHmm(d)}`;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { loading, announcement, fetchAnnouncement } = useAnnouncementDetail();

  useEffect(() => {
    if (!id) return;
    fetchAnnouncement(id).catch(() => {
      // nếu cần thì redirect về list
      // router.push("/student/home");
    });
  }, [id, fetchAnnouncement]);

  const handleBack = () => {
    router.push("/student/home");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-nav hover:text-nav-active"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to announcements</span>
      </button>

      <section className="card px-6 py-5">
        {loading && !announcement ? (
          <div className="flex h-40 items-center justify-center text-sm text-[color:var(--text-muted)]">
            Loading announcement...
          </div>
        ) : !announcement ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-[color:var(--text-muted)]">
            <p>Announcement not found.</p>
            <p className="mt-1 text-xs opacity-80">
              It may have been removed or is no longer available.
            </p>
          </div>
        ) : (
          <article className="flex flex-col gap-4">
            {/* Header info */}
            <header className="border-b border-[color:var(--border)] pb-4">
              <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                {formatAudience(announcement.audience)}
              </span>

              {/* Title row + time bên phải */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="text-sm font-semibold text-[color:var(--text-muted)]">
                    Title:
                  </span>
                  <h1 className="truncate text-xl font-semibold tracking-tight text-nav sm:text-2xl">
                    {announcement.title}
                  </h1>
                </div>

                <div className="text-xs text-[color:var(--text-muted)] sm:text-right sm:text-sm">
                  {formatTime(announcement.publishedAt)}
                </div>
              </div>

              {/* Người thông báo */}
              {announcement.createdByName && (
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Posted by{" "}
                  <span className="font-medium">
                    {announcement.createdByName}
                  </span>
                </p>
              )}
            </header>

            {/* Content bằng TinyMCE read-only */}
            <div className="mt-2">
              <LiteRichTextEditor
                value={announcement.content || ""}
                onChange={() => {}}
                readOnly
                className="min-h-[320px]"
                placeholder="No description."
              />
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
