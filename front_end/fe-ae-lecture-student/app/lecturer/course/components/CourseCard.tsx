"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useDeleteCourseImage } from "@/hooks/course/useDeleteCourseImage";
import { useUploadCourseImage } from "@/hooks/course/useUploadCourseImage";
import { CourseItem, CourseStatus } from "@/types/courses/course.response";
import { ImageUp, Loader2, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import { toast } from "sonner";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB") : "-";

type Props = {
  course: CourseItem;
  onEdit: () => void;
  onDelete: () => void;
  onUpdated: () => void;
};

export default function CourseCard({ course, onEdit, onDelete, onUpdated }: Props) {
  const router = useRouter();

  const { uploadCourseImage, loading: uploading } = useUploadCourseImage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { deleteCourseImage, loading: deleting } = useDeleteCourseImage();

  const hasCodeFeature = !!course.requiresAccessCode;
  const accessActive = hasCodeFeature && !course.isAccessCodeExpired;

  // Use global fallback class `.clamp-2-fallback` defined in `app/globals.css`

  const statusInfo = useMemo(() => {
    const s = course.status;
    if (s === undefined || s === null)
      return { label: undefined, className: "" };
    switch (s) {
      case CourseStatus.PendingApproval:
        return { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case CourseStatus.Active:
        return { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case CourseStatus.Inactive:
        return { label: "Inactive", className: "bg-slate-100 text-slate-600 border-slate-200" };
      case CourseStatus.Rejected:
        return { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: String(s), className: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  }, [course.status]);



  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onImageClick = (e: React.MouseEvent) => {
    stop(e);
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const res = await uploadCourseImage({ courseId: course.id, image: f });
      if (res?.success) {
        toast.success(res.message || "Course image uploaded");
        onUpdated();
      } else {
        toast.error(res?.message || "Failed to upload image");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onEditClick = (e: React.MouseEvent) => {
    stop(e);
    router.push(`/lecturer/course/${course.id}/course`);
  };

  const backgroundImage = course.img || "https://i.postimg.cc/VL3PwwpK/Gemini-Generated-Image-pu4lm6pu4lm6pu4l.png";

  return (
    <Card className="relative py-0 gap-3 p-3 overflow-hidden h-full flex flex-col rounded-lg border-slate-200 hover:shadow-lg transition-shadow">
      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-50 group">
        <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} aria-label="Upload course image" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute left-1.5 top-1.5 flex items-center gap-2">
          <div className="flex items-center bg-white/90 text-slate-700 rounded-md px-2 py-1 text-xs shadow">
            <Users className="mr-1 size-4" />
            <span className="font-medium">{course.enrollmentCount}</span>
          </div>
        </div>

        {/* When an image exists, render the Trash button first as a peer so it can hide the centered ImageUp on hover. */}
        {course.img && (
          <button
            onClick={(e) => {
              stop(e);
              // allow image delete via the hook
              (async () => {
                if (deleting) return;
                if (!course.id) return;
                const res = await deleteCourseImage({ courseId: course.id });
                if (res?.success) onUpdated();
              })();
            }}
            title="Delete image"
            aria-label="Delete course image"
            className="absolute top-2 right-2 z-30 bg-white/90 cursor-pointer hover:shadow-md rounded-full p-2 text-red-500 shadow peer"
          >
            <Trash2 className="size-4" />
          </button>
        )}

        {/* Upload button: - if there's an image, show a centered button that appears on hover; - otherwise keep small top-right button */}
        {course.img ? (
          <button
            onClick={onImageClick}
            title="Change course image"
            aria-label="Change course image"
            className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 peer-hover:opacity-0 transition-opacity cursor-pointer duration-150"
          >
            <span className="bg-white/90 rounded-full p-3 text-slate-700 shadow cursor-pointer">
              <ImageUp className="size-5" />
            </span>
          </button>
        ) : (
          <button
            onClick={onImageClick}
            title={course.img ? "Change course image" : "Upload course image"}
            aria-label={course.img ? "Change course image" : "Upload course image"}
            className="absolute top-2 right-2 z-20 cursor-pointer bg-white/90 rounded-full p-2 text-slate-700 shadow"
          >
            <ImageUp className="size-4" />
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
        )}

        {!course.img && !uploading && (
          <div className="absolute left-3 bottom-3 text-white text-xs bg-black/40 rounded px-2 py-1">No image</div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{course.courseCodeTitle || course.name}</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">[{course.courseCode}]</p>
          </div>
          {statusInfo.label && (
            <Badge className={`text-[11px] ${statusInfo.className}`}>{statusInfo.label}</Badge>
          )}
        </div>
        <div className="mt-3 flex-1">
          <p className="text-xs text-slate-600 line-clamp-2 leading-5">
            {course.description || "-"}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {course.department && <Badge className="text-xs bg-slate-100 text-slate-500">{course.department}</Badge>}
          {(course.term) && (
            <Badge className="text-xs bg-brand/10 text-brand">{course.term}</Badge>
          )}
          {hasCodeFeature && (
            <Badge className={accessActive ? "text-xs bg-green-50 text-green-700" : "text-xs bg-slate-100 text-slate-600"}>
              {accessActive ? "Access Code Active" : "Access Code Expired"}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="text-xs text-slate-500">Created: {fmtDate(course.createdAt)}</div>
          <div>
            <button
              onClick={(e) => {
                stop(e);
                onEditClick(e as unknown as React.MouseEvent);
              }}
              className="inline-flex items-center gap-2 btn btn-gradient-slow px-3 py-1.5 border rounded-md text-sm bg-white hover:bg-slate-50 shadow-sm"
              aria-label="View course"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
