"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Users, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";

export default function StudentCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: course, loading, error, fetchCourseById } = useGetCourseById();

  useEffect(() => {
    if (id && typeof id === "string") fetchCourseById(id);
  }, [id, fetchCourseById]);

  // Loading state
  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-green-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading course details...</span>
      </div>
    );

  // Error or not found
  if (error || !course)
    return (
      <div className="text-center py-16 text-slate-500">
        <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <p>{error || "Course not found."}</p>
        <Button
          onClick={() => router.push("/student/my-courses")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Courses
        </Button>
      </div>
    );

  return (
    <motion.div
      className="flex flex-col gap-6 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-green-700">
            <BookOpen className="w-7 h-7 text-green-600" />
            {course.courseCode} – {course.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Managed by <b>{course.lecturerName}</b>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/student/my-courses")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Info Card */}
      <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Course Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <span>
              <b>{course.enrollmentCount}</b> students enrolled
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-green-600" />
            <span>
              <b>Term:</b> {course.term} ({course.year})
            </span>
          </div>

          <div>
            <b>Description:</b>
            <p className="text-slate-600 mt-1 whitespace-pre-line">
              {course.description || "No description provided."}
            </p>
          </div>

          {course.requiresAccessCode && (
            <div className="pt-3">
              <b>Access Code Required:</b>{" "}
              {course.isAccessCodeExpired ? (
                <span className="text-red-600 font-semibold">Expired</span>
              ) : (
                <span className="text-green-600 font-semibold">Active</span>
              )}
            </div>
          )}

          {course.department && (
            <div>
              <b>Department:</b> {course.department}
            </div>
          )}

          <div>
            <b>Created At:</b>{" "}
            {new Date(course.createdAt).toLocaleString("en-GB")}
          </div>
        </CardContent>
      </Card>

      {/* Future: Lessons, Assignments, etc. */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Upcoming Features</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>This page will soon show assignments, materials, and announcements.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
