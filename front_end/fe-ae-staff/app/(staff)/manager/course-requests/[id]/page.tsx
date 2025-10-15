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

export default function CourseRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseRequestById } = useCourseRequestById();

  // ✅ Fetch request details
  useEffect(() => {
    if (id && typeof id === "string") fetchCourseRequestById(id);
  }, [id]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading course request details...
      </div>
    );
  }

  const request = data?.courseRequest;

  // ✅ Not found
  if (!request) {
    return (
      <div className="p-6 text-center text-slate-500">
        Course request not found.
        <div className="mt-4">
          <Button onClick={() => router.push("/manager/course-requests")}>
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Helper format
  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString("en-GB") : "-";

  return (
    <div className="p-4">
      <Button
        variant="ghost"
        className="mb-3 text-sm"
        onClick={() => router.push("/manager/course-requests")}
      >
        ← Back
      </Button>

      {/* Card Info */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Course Request Detail
          </CardTitle>
          <Badge
            className={`text-xs px-2 py-1 ${
              CourseRequestStatusColor[
                request.status as CourseRequestStatus
              ]
            }`}
          >
            {CourseRequestStatusText[
              request.status as CourseRequestStatus
            ]}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 text-sm leading-relaxed">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            <p>
              <strong>Lecturer:</strong> {request.lecturerName}
            </p>
            <p>
              <strong>Course Code:</strong> {request.courseCode}
            </p>
            <p>
              <strong>Title:</strong> {request.courseCodeTitle}
            </p>
            <p>
              <strong>Term:</strong> {request.term}
            </p>
            <p>
              <strong>Year:</strong> {request.year}
            </p>
            <p>
              <strong>Department:</strong> {request.department}
            </p>
            <p className="sm:col-span-2">
              <strong>Request Reason:</strong>{" "}
              {request.requestReason || "-"}
            </p>
            <p className="sm:col-span-2">
              <strong>Processing Comments:</strong>{" "}
              {request.processingComments || "-"}
            </p>
            <p>
              <strong>Processed By:</strong> {request.processedByName || "-"}
            </p>
            <p>
              <strong>Processed At:</strong> {fmtDate(request.processedAt)}
            </p>
            <p>
              <strong>Created At:</strong> {fmtDate(request.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Approve / Reject actions */}
      <ProcessActions
        id={request.id}
        currentStatus={request.status}
        onProcessed={() => fetchCourseRequestById(request.id)}
      />
    </div>
  );
}
