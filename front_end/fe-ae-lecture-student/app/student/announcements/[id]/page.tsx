// app/student/announcements/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAnnouncementDetail } from "@/hooks/announcements/useAnnouncementDetail";
import type { AnnouncementItem } from "@/types/announcements/announcement.response";

import { parseServerDate, dayLabel, timeHHmm } from "@/utils/chat/time";
import LiteRichTextEditor from "@/components/common/TinyMCE";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const handleGoList = () => {
    router.push("/student/home");
  };

  const title = announcement?.title || "Announcement detail";

  return (
    <div className="mx-auto  px-4 py-6">
      {/* Breadcrumb thay cho back button */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-sm text-nav hover:text-nav-active"
                onClick={handleGoList}
              >
                Announcements
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[220px] truncate text-sm text-[color:var(--text-muted)]">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="card px-4 py-4">
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
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2 min-w-0">
                  <span className="text-2xl font-semibold text-[color:var(--text-muted)]">
                    Title:
                  </span>
                  <h1 className="break-words text-2xl font-semibold tracking-tight text-nav sm:text-3xl">
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

            {/* Content bằng TinyMCE read-only, padding nhẹ */}
            <div className="mt-2">
              <LiteRichTextEditor
                value={announcement.content || ""}
                onChange={() => {}}
                readOnly
                className="min-h-[260px]"
                placeholder="No description."
              />
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
