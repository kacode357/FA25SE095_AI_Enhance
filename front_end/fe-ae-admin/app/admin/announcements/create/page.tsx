// app/admin/announcements/page.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import LiteRichTextEditor from "@/components/common/TinyMCE";

import { useCreateAnnouncement } from "@/hooks/announcements/useCreateAnnouncement";
import { AnnouncementAudience } from "@/types/announcements/announcement.response";

function isHtmlEmpty(html: string) {
  const text = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim();
  return text.length === 0;
}

export default function AdminAnnouncementsPage() {
  const { createAnnouncement, loading } = useCreateAnnouncement();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML TinyMCE
  const [audience, setAudience] = useState<AnnouncementAudience>(
    AnnouncementAudience.All
  );

  const [publishedAt, setPublishedAt] = useState<string | undefined>(
    new Date().toISOString()
  );

  const resetForm = () => {
    setTitle("");
    setContent("");
    setAudience(AnnouncementAudience.All);
    setPublishedAt(new Date().toISOString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || isHtmlEmpty(content)) {
      return;
    }

    const isoPublishedAt = publishedAt || new Date().toISOString();

    await createAnnouncement({
      title: title.trim(),
      content,
      audience,
      publishedAt: isoPublishedAt,
    });

    resetForm();
  };

  return (
    // ❌ bỏ px-6 + max-w-3xl -> full width theo layout
    <div className="flex w-full flex-col gap-6 py-8">
      <header className="mb-2 px-6">
        <h1 className="text-xl font-semibold text-nav">Create announcement</h1>
        <p className="mt-1 text-xs text-[color:var(--text-muted)]">
          Send an announcement to students, lecturers or all users.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl px-6 w-full"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-nav">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="border-[var(--border)] rounded-xl"
          />
        </div>

        {/* Audience + Publish at */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-nav">Audience</label>
            <Select
              value={audience.toString()}
              onValueChange={(value) =>
                setAudience(Number(value) as AnnouncementAudience)
              }
            >
              <SelectTrigger className="w-full h-9  border-[var(--border)] text-sm">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AnnouncementAudience.All.toString()}>
                  All
                </SelectItem>
                <SelectItem value={AnnouncementAudience.Students.toString()}>
                  Students
                </SelectItem>
                <SelectItem value={AnnouncementAudience.Lecturers.toString()}>
                  Lecturers
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-nav">Publish at</label>
            <DateTimePicker
              value={publishedAt}
              onChange={(val) => setPublishedAt(val)}
              placeholder="yyyy-MM-dd HH:mm"
              className="w-full"
              minDate={new Date()}
              timeIntervals={5}
              size="lg"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-nav">
            Content <span className="text-red-500">*</span>
          </label>
          <LiteRichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your announcement content..."
            className="rounded-lg overflow-hidden border border-[var(--border)] bg-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={resetForm}
            className={clsx(
              "btn px-5 py-2 text-sm rounded-xl border border-[var(--border)] bg-white text-[color:var(--text-muted)]",
              "hover:bg-[color-mix(in_oklab,var(--brand)_4%,#f9fafb)]",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "btn btn-green-slow px-5 py-2 text-sm rounded-xl",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            {loading ? "Creating..." : "Create announcement"}
          </button>
        </div>
      </form>
    </div>
  );
}
