// app/admin/announcements/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Megaphone, ArrowLeft, Loader2, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

import { useAnnouncementDetail } from "@/hooks/announcements/useAnnouncementDetail";
import { useUpdateAnnouncement } from "@/hooks/announcements/useUpdateAnnouncement";

import { AnnouncementAudience } from "@/types/announcements/announcement.response";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

function getAudienceLabel(audience?: AnnouncementAudience) {
  switch (audience) {
    case AnnouncementAudience.Students:
      return "Students";
    case AnnouncementAudience.Lecturers:
      return "Lecturers";
    case AnnouncementAudience.All:
    default:
      return "All Users";
  }
}

export default function AnnouncementDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { loading, announcement, fetchAnnouncement } = useAnnouncementDetail();
  const { updateAnnouncement, loading: updating } = useUpdateAnnouncement();

  const id = params?.id as string | undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAudience, setFormAudience] = useState<AnnouncementAudience>(
    AnnouncementAudience.All
  );
  // DateTimePicker dùng string | undefined
  const [formPublishedAt, setFormPublishedAt] = useState<string | undefined>(
    undefined
  );
  const [formContent, setFormContent] = useState("");

  // fetch detail
  useEffect(() => {
    if (!id) return;
    fetchAnnouncement(id);
  }, [id, fetchAnnouncement]);

  const title = announcement?.title || "Announcement detail";

  // Khi bấm Edit: sync state form từ announcement
  const handleStartEdit = () => {
    if (!announcement) return;
    setFormTitle(announcement.title || "");
    setFormAudience(announcement.audience ?? AnnouncementAudience.All);
    setFormPublishedAt(
      announcement.publishedAt || new Date().toISOString()
    );
    setFormContent(announcement.content || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle.trim(),
      content: formContent,
      audience: formAudience,
      // formPublishedAt là string, fallback sang now nếu rỗng
      publishedAt: formPublishedAt || new Date().toISOString(),
    };

    const res = await updateAnnouncement(id, payload);

    if (res) {
      await fetchAnnouncement(id);
      setIsEditing(false);
    }
  };

  const isLoadingInitial = loading && !announcement;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb + back */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => router.push("/admin/announcements")}
                  className="cursor-pointer"
                >
                  Announcements
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[220px] truncate">
                  {announcement?.title || "Detail"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs"
                disabled={!announcement}
                onClick={handleStartEdit}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            )}

            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs"
                onClick={handleCancelEdit}
                disabled={updating}
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => router.push("/admin/announcements")}
            >
              <ArrowLeft className="h-3 w-3" />
              Back to list
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
            <Megaphone className="h-5 w-5" />
          </div>

          {/* View mode header */}
          {!isEditing && (
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>
                  Audience:{" "}
                  <span className="font-medium text-slate-700">
                    {getAudienceLabel(announcement?.audience)}
                  </span>
                </span>
                <span>•</span>
                <span>
                  Published at{" "}
                  <span className="font-medium text-slate-700">
                    {formatDateTimeVN(announcement?.publishedAt || null)}
                  </span>
                </span>
                {announcement?.createdByName && (
                  <>
                    <span>•</span>
                    <span>
                      Created by{" "}
                      <span className="font-medium text-slate-700">
                        {announcement.createdByName}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Edit mode header (form controls trên vùng header) */}
          {isEditing && (
            <div className="flex-1 space-y-3">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Announcement title"
                className="text-base font-semibold"
              />

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Audience:</span>
                  <Select
                    value={String(formAudience)}
                    onValueChange={(val) =>
                      setFormAudience(Number(val) as AnnouncementAudience)
                    }
                  >
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(AnnouncementAudience.All)}>
                        All Users
                      </SelectItem>
                      <SelectItem
                        value={String(AnnouncementAudience.Students)}
                      >
                        Students
                      </SelectItem>
                      <SelectItem
                        value={String(AnnouncementAudience.Lecturers)}
                      >
                        Lecturers
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <span>•</span>

                <div className="flex items-center gap-2">
                  <span>Published at:</span>
                  <DateTimePicker
                    value={formPublishedAt}
                    onChange={(date) => setFormPublishedAt(date)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content / Edit form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {isLoadingInitial && (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading announcement...
          </div>
        )}

        {!isLoadingInitial && !announcement && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
            <p>Announcement not found.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => router.push("/admin/announcements")}
            >
              Back to list
            </Button>
          </div>
        )}

        {announcement && !isEditing && (
          <div className="prose max-w-none prose-sm prose-slate">
            {announcement.content ? (
              <div
                className="mt-1 text-sm leading-relaxed text-slate-800"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            ) : (
              <p className="text-sm text-slate-500 italic">
                No content for this announcement.
              </p>
            )}
          </div>
        )}

        {announcement && isEditing && (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">
                Content
              </p>
              <LiteRichTextEditor
                value={formContent}
                onChange={(val) => setFormContent(val)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                onClick={handleSave}
                disabled={updating || !formTitle.trim()}
              >
                {updating && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
