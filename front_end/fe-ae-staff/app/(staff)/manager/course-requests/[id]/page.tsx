"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourseRequestById } from "@/hooks/course-request/useCourseRequestById";

export default function CourseRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseRequestById } = useCourseRequestById();

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchCourseRequestById(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading request details...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-500">
        Course request not found.
        <div className="mt-4">
          <Button onClick={() => router.push("/manager/course-requests")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Button
        variant="ghost"
        className="mb-3 text-sm"
        onClick={() => router.push("/manager/course-requests")}
      >
        ← Back
      </Button>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Course Request Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><strong>Lecturer:</strong> {data.lecturerName}</p>
          <p><strong>Course Code:</strong> {data.courseCode}</p>
          <p><strong>Title:</strong> {data.courseCodeTitle}</p>
          <p><strong>Term:</strong> {data.term}</p>
          <p><strong>Year:</strong> {data.year}</p>
          <p><strong>Department:</strong> {data.department}</p>
          <p><strong>Status:</strong> {["Pending", "Approved", "Rejected", "Cancelled"][data.status - 1]}</p>
          <p><strong>Request Reason:</strong> {data.requestReason || "-"}</p>
          <p><strong>Processing Comments:</strong> {data.processingComments || "-"}</p>
          <p><strong>Processed By:</strong> {data.processedByName || "-"}</p>
          <p><strong>Processed At:</strong> {data.processedAt ? new Date(data.processedAt).toLocaleString("en-GB") : "-"}</p>
          <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString("en-GB")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
