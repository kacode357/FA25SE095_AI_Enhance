"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CourseRequestStatus,
  CourseRequestStatusColor,
  CourseRequestStatusText,
} from "@/config/course-request-status";
import { useCourseRequestById } from "@/hooks/course-request/useCourseRequestById";
import ProcessActions from "../components/ProcessActions";
import { ArrowLeft } from "lucide-react";

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
        <div className="mt-4">
          <Button onClick={() => router.push("/staff/manager/course-requests")}>
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  // helpers (no hooks)
  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString("en-GB") : "-";

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
          className="text-sm"
          onClick={() => router.push("/staff/manager/course-requests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Badge
          className={`text-xs px-2 py-1 ${statusBg} ${
            CourseRequestStatusColor[request.status as CourseRequestStatus]
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
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <Field label="Lecturer" value={request.lecturerName} />
              <Field label="Course Code" value={request.courseCode} />
              <Field label="Title" value={request.courseCodeTitle} />
              <Field label="Department" value={request.department} />
              <Field label="Term" value={request.term} />
              <Field label="Year" value={String(request.year)} />
            </div>
          </section>

          {/* Section: Processing */}
          <section>
            <h3 className="text-sm font-medium text-slate-600 mb-3">
              Processing
            </h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <Field
                label="Processed By"
                value={request.processedByName || "-"}
              />
              <Field label="Processed At" value={fmtDate(request.processedAt)} />
              <Field
                label="Created At"
                value={fmtDate(request.createdAt)}
                className="md:col-span-2"
              />
            </div>
          </section>

          {/* Section: Notes */}
          <section>
            <h3 className="text-sm font-medium text-slate-600 mb-3">Notes</h3>
            <div className="grid gap-3">
              <Field
                label="Request Reason"
                value={request.requestReason || "-"}
                multiline
              />
              <Field
                label="Processing Comments"
                value={request.processingComments || "-"}
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
  value: string;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
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
