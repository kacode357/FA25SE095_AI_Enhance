"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadCourseImage } from "@/hooks/course/useUploadCourseImage";
import { CourseItem, CourseStatus } from "@/types/courses/course.response";
import { ImageUp, Loader2, Users } from "lucide-react";
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

  const hasCodeFeature = !!course.requiresAccessCode;
  const accessActive = hasCodeFeature && !course.isAccessCodeExpired;

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

  const goDetail = () => router.push(`/lecturer/course/${course.id}`);
  const onKeyEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail();
    }
  };

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

  const backgroundImage = course.img || "https://st4.depositphotos.com/41116220/41454/v/450/depositphotos_414548128-stock-illustration-online-course-icon-simple-line.jpg";

  return (
    <Card
      className="relative overflow-hidden h-full -py-6 gap-1 flex flex-col border-slate-200 hover:shadow-[0_8px_24px_rgba(2,6,23,0.06)] focus:outline-none focus:ring-0"
      tabIndex={0}
      role="button"
      onKeyDown={onKeyEnter}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7f71f4] via-[#a786f9] to-[#f4a23b]"
      />

      <div
        className={`relative h-52 w-full bg-cover bg-center flex items-center justify-center group transition-all duration-300`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} aria-label="Upload course image" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
        {!course.img && !uploading && (
          <span className="relative z-10 text-white text-sm font-medium transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none">
            No image
          </span>
        )}

        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={onImageClick}
          role="button"
          aria-label={course.img ? "Change course image" : "Upload course image"}
        >
          <div className="flex flex-col items-center justify-center">
            <ImageUp className="cursor-pointer" size={36} />
            <span className="text-xs mt-1 cursor-pointer">Upload image</span>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <CardTitle className="text-sm font-semibold text-white truncate">
            [{course.courseCode}] {course.courseCodeTitle}
          </CardTitle>
          {course.department && (
            <Badge
              variant="outline"
              className="mt-2 text-[11px] bg-white/20 text-white border-white/30"
            >
              {course.department}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2 px-4 pt-4 bg-white">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex bg-orange-100 rounded-xs items-center gap-1 px-2 py-1">
            <Users className="size-4" />
            <span>{course.enrollmentCount} enrollments</span>
          </div>
          {statusInfo.label && (
            <Badge variant="outline" className={`text-[11px] ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          )}
        </div>

        <div className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2 overflow-hidden h-[3rem]">
          {course.description || "-"}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-4 flex flex-col bg-white">
        <div className="flex-1" />
        {hasCodeFeature && (
          <div className="flex gap-2 mt-3 mb-2">
            <Badge className={accessActive ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"}>
              {accessActive ? "Access Code Active" : "Access Code Expired"}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between gap-1 mt-auto pt-2">
          <div className="flex flex-col gap-1">
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {(course.term || course.year) && (
                <Badge className="text-xs bg-brand/10 text-brand border border-brand/20">
                  {course.term || ""}
                  {course.term && course.year ? " • " : ""}
                  {course.year ?? ""}
                </Badge>
              )}
            </div>
            <div className="flex-1 text-xs text-slate-500">
              Created: {fmtDate(course.createdAt)}
            </div>
          </div>
          <div
            className="btn btn-gradient-slow rounded-md text-white px-3 py-1 shadow text-xs cursor-pointer transition-all duration-200"
            onClick={onEditClick}
            aria-label="Course Details"
          >
            Details
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
