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
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ProcessCourseActions from "../components/ProcessCourseActions";

export default function CourseApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseById } = useCourseById();

  useEffect(() => {
    if (id && typeof id === "string") fetchCourseById(id);
  }, [id]);

  const course = data?.course;

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading course details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center text-slate-500">
        Course not found.
        <div className="mt-4">
          <Button className="btn btn-gradient-slow" onClick={() => router.push("/staff/course-approvals")}>
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString("en-GB") : "-";

  const isPending = course.status === CourseStatus.PendingApproval;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="text-sm btn btn-gradient-slow"
          onClick={() => router.push("/staff/course-approvals")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Single main card with footer actions */}
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

            {/* Status chip: dùng text color từ config + border-current */}
            <Badge
              className={`text-xs px-2 py-1 border bg-white ${getCourseStatusColor(
                course.status
              )} border-current`}
            >
              {getCourseStatusText(course.status)}
            </Badge>
          </div>

          {/* Title line dưới header cho nổi bật tên course */}
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            {course.courseCodeTitle}
          </h2>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Grid thông tin */}
          <section className="grid md:grid-cols-2 gap-x-10 gap-y-4 text-sm">
            <Field label="Course Code" value={course.courseCode} />
            <Field label="Lecturer" value={course.lecturerName} />
            <Field label="Department" value={course.department} />
            <Field label="Created At" value={fmtDate(course.createdAt)} />
            <Field label="Term" value={course.term} />
            <Field label="Year" value={String(course.year)} />
          </section>

          <div className="h-px bg-slate-200/80" />

          <section className="text-sm">
            <Field
              label="Description"
              value={course.description || "-"}
              multiline
            />
          </section>
        </CardContent>

        {/* Footer actions (chỉ hiện khi PendingApproval) */}
        {isPending && (
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
        className={`mt-1 text-slate-900 ${
          multiline ? "whitespace-pre-wrap" : ""
        }`}
      > 
        {value}
      </div>
    </div>
  );
}
