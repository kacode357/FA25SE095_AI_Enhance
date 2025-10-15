"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourseById } from "@/hooks/course/useCourseById";
import {
  getCourseStatusColor,
  getCourseStatusText,
} from "@/config/course-status";
import ProcessCourseActions from "../components/ProcessCourseActions";

export default function CourseApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseById } = useCourseById();

  useEffect(() => {
    if (id && typeof id === "string") fetchCourseById(id);
  }, [id]);

  const course = data?.course;

  if (loading)
    return (
      <div className="p-6 text-center text-slate-500">
        Loading course details...
      </div>
    );

  if (!course)
    return (
      <div className="p-6 text-center text-slate-500">
        Course not found.
        <div className="mt-4">
          <Button onClick={() => router.push("/manager/course-approvals")}>
            Back
          </Button>
        </div>
      </div>
    );

  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString("en-GB") : "-";

  return (
    <div className="min-h-screen p-5 bg-white text-slate-900 space-y-6">
      {/* ✅ Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Course Approval Detail
          </h1>
          <p className="text-sm text-slate-500">
            Review and process this course request.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push("/manager/course-approvals")}>
          ← Back
        </Button>
      </div>

      {/* ✅ Course Info Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">
            {course.courseCodeTitle}
          </CardTitle>
          <Badge className={`text-xs px-2 py-1 ${getCourseStatusColor(course.status)}`}>
            {getCourseStatusText(course.status)}
          </Badge>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-600">Course Code:</span>{" "}
            {course.courseCode}
          </p>
          <p>
            <span className="font-medium text-slate-600">Lecturer:</span>{" "}
            {course.lecturerName}
          </p>
          <p>
            <span className="font-medium text-slate-600">Department:</span>{" "}
            {course.department}
          </p>
          <p>
            <span className="font-medium text-slate-600">Created At:</span>{" "}
            {fmtDate(course.createdAt)}
          </p>
          <p>
            <span className="font-medium text-slate-600">Term:</span>{" "}
            {course.term}
          </p>
          <p>
            <span className="font-medium text-slate-600">Year:</span>{" "}
            {course.year}
          </p>
          <p className="col-span-2">
            <span className="font-medium text-slate-600">Description:</span>{" "}
            {course.description || "-"}
          </p>
        </CardContent>
      </Card>

      {/* ✅ Action Section */}
      <div className="mt-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">
              Process Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessCourseActions
              id={course.id}
              currentStatus={course.status}
              onProcessed={() => fetchCourseById(course.id)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
