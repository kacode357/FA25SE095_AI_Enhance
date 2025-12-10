"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CourseRequestStatus,
  CourseRequestStatusColor,
  CourseRequestStatusText,
} from "@/config/course-request-status";
import { useCourseRequestById } from "@/hooks/course-request/useCourseRequestById";
import { formatToVN } from "@/utils/datetime/time";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import ProcessActions from "../components/ProcessActions";

export default function CourseRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseRequestById } = useCourseRequestById();

  // always-on hooks at top
  useEffect(() => {
    if (id && typeof id === "string") fetchCourseRequestById(id);
  }, [id]);

  // loading
  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading course request details...
      </div>
    );
  }

  const request = data?.courseRequest;

  // not found
  if (!request) {
    return (
      <div className="p-6 text-center text-slate-500">
        Course request not found.
        <div className="mt-4 btn btn-green-slow">
          <Button onClick={() => router.push("/staff/course-requests")}>
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  // helpers (no hooks)
  const fmtDate = (v?: string | null, withTime = false) =>
    v
      ? withTime
        ? formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        : formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit" })
      : "-";

  const getStatusBg = (st?: CourseRequestStatus) => {
    switch (st) {
      case CourseRequestStatus.Pending:
        return "bg-yellow-50";
      case CourseRequestStatus.Approved:
        return "bg-green-50";
      case CourseRequestStatus.Rejected:
        return "bg-red-50";
      case CourseRequestStatus.Cancelled:
        return "bg-slate-100";
      default:
        return "bg-slate-100";
    }
  };

  const isPending = request.status === CourseRequestStatus.Pending;
  const statusBg = getStatusBg(request.status as CourseRequestStatus);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-sm btn btn-green-slow"
          onClick={() => router.push("/staff/course-requests")}
        >
          <ArrowLeft className="mr-0 h-4 w-4" />
          Back
        </Button>

        <Badge
          className={`text-xs px-2 py-1 ${statusBg} ${CourseRequestStatusColor[request.status as CourseRequestStatus]
            }`}
        >
          {CourseRequestStatusText[request.status as CourseRequestStatus]}
        </Badge>
      </div>

      {/* Main card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">
            Course Request Detail
          </CardTitle>
          <p className="text-slate-500 text-sm">
            Review the lecturer’s request and take action below.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section: Basic info */}
          <section>
            <h3 className="text-sm font-medium text-slate-600 mb-3">
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
              <Field className="text-xs" label="Lecturer" value={request.lecturerName} />
              <Field className="text-xs" label="Course Code" value={request.courseCode} />
              <Field className="text-xs" label="Title" value={request.courseCodeTitle} />
              <Field className="text-xs" label="Department" value={request.department} />
              <Field className="text-xs" label="Term" value={request.term} />
              <Field className="text-xs"
                label="Created At"
                value={fmtDate(request.createdAt)}
              />
              <Field
                className="text-xs"
                label="Syllabus"
                value={
                  request.syllabusFile ? (
                    <a
                      href={request.syllabusFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 underline"
                    >
                      {request.syllabusFile || 'Download syllabus'}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
            </div>
          </section>

          {/* Section: Processing */}
          {/* <section>
            <h3 className="text-sm font-medium text-slate-600 mb-3">
              Processing
            </h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <Field
                label="Processed By"
                value={request.processedByName || "-"}
              />
              <Field label="Processed At" value={fmtDate(request.processedAt, true)} />
            </div>
          </section> */}

          {/* Section: Notes */}
          <section>
            <h3 className="text-sm font-medium text-slate-600 mb-3">Notes</h3>
            <div className="grid gap-3">
              <HighlightBox label="Request Reason">
                <span className="text-xs">{request.requestReason || '-'}</span>
              </HighlightBox>

              <Field
                label="Description"
                className="text-xs"
                value={request.description || "-"}
                multiline
              />
            </div>
          </section>
        </CardContent>

        {/* Action bar: chỉ hiện khi Pending */}
        {isPending && (
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <ProcessActions
                id={request.id}
                currentStatus={request.status}
                onProcessed={() => fetchCourseRequestById(request.id)}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
  className = "",
}: {
  label: string;
  value: ReactNode;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </div>
      <div
        className={`mt-1 text-slate-900 ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function HighlightBox({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium mb-2">{label}</div>
      <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded p-4 text-slate-900 whitespace-pre-wrap shadow-sm">
        {children}
      </div>
    </div>
  );
}
