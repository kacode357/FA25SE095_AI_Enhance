"use client";

import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CourseStatus,
  getCourseStatusColor,
  getCourseStatusText,
} from "@/config/course-status";
import { useCourseById } from "@/hooks/course/useCourseById";
import { formatToVN } from "@/utils/datetime/time";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ProcessCourseActions from "../components/ProcessCourseActions";
import LiteRichTextEditor from "@/components/common/TinyMCE";

export default function CourseApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseById } = useCourseById();

  useEffect(() => {
    if (id && typeof id === "string") fetchCourseById(id);
  }, [id]);

  const course = data?.course;

  if (!course) {
    return (
      <div className="p-6 text-center text-slate-500">
        Course not found.
        <div className="mt-4">
          <Button className="btn btn-green-slow" onClick={() => router.push("/staff/course-approvals")}>
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  const fmtDate = (v?: string | null) => {
    if (!v) return "-";
    return formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const isPending = course?.status === CourseStatus.PendingApproval;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          className="text-sm btn btn-green-slow"
          onClick={() => router.push("/staff/course-approvals")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main card */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-semibold leading-tight">
                Course Approval Detail
              </CardTitle>
              <p className="text-slate-500 text-sm mt-1">
                Review and process this course request.
              </p>
            </div>

            <Badge
              className={`text-xs px-2 py-1 border bg-white ${getCourseStatusColor(
                course.status
              )} border-current`}
            >
              {getCourseStatusText(course.status)}
            </Badge>
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            {course.courseCodeTitle}{" "}
            <span className="text-slate-400 font-normal text-base">
              ({course.courseCode})
            </span>
          </h2>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Grid thông tin chi tiết */}
          <section className="grid md:grid-cols-3 gap-x-8 gap-y-6 text-sm">
            <Field label="System Name" value={course.name} />
            <Field label="Unique Code" value={course.uniqueCode} />
            <Field label="Department" value={course.department} />

            <Field label="Lecturer" value={course.lecturerName} />
            <Field label="Term" value={course.term} />
            <Field label="Enrollment Count" value={course.enrollmentCount.toString()} />

            <Field label="Term Start Date" value={fmtDate(course.termStartDate)} />
            <Field label="Term End Date" value={fmtDate(course.termEndDate)} />
            <Field label="Created At" value={fmtDate(course.createdAt)} />

            <Field
              label="Requires Access Code"
              value={course.requiresAccessCode ? "Yes" : "No"}
            />
            {course.requiresAccessCode && (
              <Field label="Access Code" value={course.accessCode || "Not set"} />
            )}
          </section>

          <div className="h-px bg-slate-200/80" />

          {/* Section: Description & Announcement */}
          <section className="grid md:grid-cols-2 gap-8 text-sm">
            {/* Cột trái: Description */}
            <Field
              label="Description"
              value={course.description || "-"}
              multiline
            />

            {/* Cột phải: Announcement (Dùng TinyMCE ReadOnly) */}
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium mb-1">
                Announcement
              </div>
              {course.announcement ? (
                // 👇 Đã xóa 'border border-slate-200' ở đây để tránh bị 2 viền
                <div className="mt-1 rounded-md overflow-hidden">
                  <LiteRichTextEditor
                    value={course.announcement}
                    onChange={() => {}}
                    readOnly={true}
                    placeholder="No announcement content"
                  />
                </div>
              ) : (
                <span className="text-slate-900">-</span>
              )}
            </div>
          </section>
        </CardContent>

        {/* Footer actions */}
        {isPending && course && (
          <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Take an action to approve or reject this course.
              </p>
              <div className="flex items-center gap-2">
                <ProcessCourseActions
                  id={course.id}
                  currentStatus={course.status}
                  onProcessed={() => fetchCourseById(course.id)}
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* Small field comp */
function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </div>
      <div
        className={`mt-1 text-slate-900 break-words ${
          multiline ? "whitespace-pre-wrap" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}