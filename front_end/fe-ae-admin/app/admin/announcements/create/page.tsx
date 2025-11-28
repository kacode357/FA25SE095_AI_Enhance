// app/admin/announcements/page.tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Không toast lỗi, chỉ chặn submit nếu thiếu
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

    // ✅ chỉ reset form, thông báo thành công đã nằm trong hook
    setTitle("");
    setContent("");
    setAudience(AnnouncementAudience.All);
    setPublishedAt(new Date().toISOString());
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setAudience(AnnouncementAudience.All);
    setPublishedAt(new Date().toISOString());
  };

  return (
    <div className="flex w-full flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Create announcements</h1>
 
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
          />
        </div>

        {/* Content (TinyMCE) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Content <span className="text-red-500">*</span>
          </label>
          <LiteRichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your announcement content..."
            className="rounded-lg overflow-hidden border border-slate-200 bg-white"
          />
        </div>

        {/* Audience + Publish at */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Audience
            </label>
            <Select
              value={audience.toString()}
              onValueChange={(value) =>
                setAudience(Number(value) as AnnouncementAudience)
              }
            >
              <SelectTrigger className="w-full border-slate-200">
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
            <label className="text-sm font-medium text-slate-700">
              Publish at
            </label>
            <DateTimePicker
              value={publishedAt}
              onChange={(val) => setPublishedAt(val)}
              placeholder="yyyy-MM-dd HH:mm"
              className="w-full"
              minDate={new Date()}
              timeIntervals={5}
              size="md"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleReset}
          >
            Reset
          </Button>

          {/* Nút tạo dùng style trong globals.css */}
          <button
            type="submit"
            disabled={loading}
            className={`btn btn-gradient px-5 py-2 text-sm ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create announcement"}
          </button>
        </div>
      </form>
    </div>
  );
}
