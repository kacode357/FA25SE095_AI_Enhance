"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseItem, CourseStatus } from "@/types/courses/course.response";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
// Access code controls were moved to EditCourse; keep CourseCard minimal.

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB") : "-";

type Props = {
  course: CourseItem;
  onEdit: () => void;
  onDelete: () => void;
  onUpdated: () => void;
};

export default function CourseCard({
  course,
  onEdit,
  onDelete,
  onUpdated,
}: Props) {
  const router = useRouter();

  // Access code UI moved to EditCourse

  const hasCodeFeature = !!course.requiresAccessCode;
  const accessActive = hasCodeFeature && !course.isAccessCodeExpired;

  const statusInfo = useMemo(() => {
    const s = course.status;
    if (s === undefined || s === null) return { label: undefined, className: "" };
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

  // Controls removed here

  const goDetail = () => router.push(`/lecturer/manager/course/${course.id}`);
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

  // Reveal/copy/update handlers removed from card

  const onEditClick = (e: React.MouseEvent) => {
    stop(e);
    router.push(`/lecturer/manager/course/${course.id}/course`);
  }

  const onDeleteClick = (e: React.MouseEvent) => {
    stop(e);
    onDelete();
  };

  return (
    <Card
      className="relative overflow-hidden h-full p-0 flex flex-col border-slate-200 hover:shadow-[0_8px_24px_rgba(2,6,23,0.06)] focus:outline-none focus:ring-2 focus:ring-brand"
      // onClick={goDetail}
      tabIndex={0}
      role="button"
      onKeyDown={onKeyEnter}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7f71f4] via-[#a786f9] to-[#f4a23b]"
      />
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex bg-orange-100 rounded-xs items-center gap-1">
            <Users className="size-4" />
            <span>{course.enrollmentCount} enrollments</span>
          </div>
          {statusInfo.label && (
            <Badge variant="outline" className={`text-[11px] ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-start justify-between gap-3 min-w-0">
          <CardTitle className="text-sm font-normal text-slate-800 flex-1 min-w-0 overflow-hidden flex items-baseline gap-1">
            <span className="font-mono text-sm text-[#7f71f4]">[{course.courseCode}]</span>
            <span className="text-slate-700 font-bold truncate">{course.courseCodeTitle}</span>
          </CardTitle>
          {course.department && (
            <Badge
              variant="outline"
              className="text-[11px] border-slate-300 text-slate-700 whitespace-nowrap"
            >
              {course.department}
            </Badge>
          )}
        </div>

        {/* Description (truncate when long) */}
        <div className="flex-1 mt-3 text-sm text-slate-600 line-clamp-2 overflow-hidden">
          {course.description || "-"}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-4 flex flex-col">
        {/* spacer ensures footer sticks to bottom */}
        <div className="flex-1" />

        {/* Access code state just above footer */}
        {hasCodeFeature && (
          <div className="flex gap-2 mt-3 mb-2">
            <Badge className={accessActive ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"}>
              {accessActive ? "Access Code Active" : "Access Code Expired"}
            </Badge>
          </div>
        )}

        {/* Actions row pinned to bottom */}
        <div className="flex items-center justify-between gap-1 mt-auto pt-2">
          <div className="flex flex-col gap-1">
            {/* Created */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {(course.term || course.year) && (
                <Badge className="text-xs bg-brand/10 text-brand border border-brand/20">
                  {course.term || ""}
                  {course.term && course.year ? " • " : ""}
                  {course.year ?? ""}
                </Badge>
              )}
            </div>
            <div className="flex-1 text-xs text-slate-500">Created: {fmtDate(course.createdAt)}</div>
          </div>
          <div
            className="btn btn-gradient-slow rounded-md text-white px-3 py-1 shadow text-xs cursor-pointer transition-all duration-200"
            onClick={onEditClick}
            aria-label="Edit"
          >
            Details
          </div>
        </div>
      </CardContent>
    </Card>
  );
}