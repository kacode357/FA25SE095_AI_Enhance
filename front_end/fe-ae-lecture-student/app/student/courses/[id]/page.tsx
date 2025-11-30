// app/student/courses/[id]/page.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CalendarDays, Users, FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import LiteRichTextEditor from "@/components/common/TinyMCE";

/** Safe parse datetime */
const toDate = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

/** Ẩn mấy ngày sentinel 0001-01-01, chỉ format ngày hợp lệ */
const formatTermDateVN = (value?: string | null): string | null => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() < 2000) return null; // 0001 or invalid -> bỏ
  return formatDateTimeVN(value);
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  const {
    data: course,
    loading: loadingCourse,
    error,
    fetchCourseById,
  } = useGetCourseById();

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchCourseById(courseId);
  }, [courseId, fetchCourseById]);

  // ===== STATES =====
  if (!courseId) {
    return (
      <div className="py-16 text-center text-muted">
        <p>
          Không tìm thấy <b>courseId</b> trong URL.
        </p>
        <button
          className="btn mt-4 border border-brand text-brand bg-card"
          onClick={() => router.push("/student/my-courses")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </button>
      </div>
    );
  }

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-brand">
        <BookOpen className="w-6 h-6 mr-2 animate-pulse" />
        <span className="text-sm">Loading course…</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-16 text-muted">
        <BookOpen className="w-10 h-10 mx-auto mb-2 text-nav" />
        <p>{error || "Course not found."}</p>
        <button
          onClick={() => router.push("/student/my-courses")}
          className="btn mt-4 border border-brand text-brand bg-card"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Courses
        </button>
      </div>
    );
  }

  // termStartDate / termEndDate (handle 0001-01-01)
  const termStartLabel = formatTermDateVN(course.termStartDate);
  const termEndLabel = formatTermDateVN(course.termEndDate);

  const createdAtLabel = course.createdAt
    ? formatDateTimeVN(course.createdAt as string)
    : "";

  const syllabusUrl = course.syllabusFile;
  const announcementHtml = course.announcement || "";

  // ===== MAIN UI =====
  return (
    <motion.div
      className="flex flex-col gap-6 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-nav">
            <BookOpen className="w-7 h-7 text-brand" />
            {course.courseCode} - {course.courseCodeTitle || course.name}
          </h1>
        </div>
       
      </div>

      {/* GRID INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: Main info (Announcement) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Announcement */}
          <Card className="card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nav">
                Announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {announcementHtml ? (
                <LiteRichTextEditor
                  value={announcementHtml}
                  onChange={() => {}}
                  readOnly
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted">No announcement yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Meta info */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
          {/* Overview */}
          <Card className="card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nav">
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {/* Lecturer info */}
              <div className="flex items-center gap-3">
                {course.lecturerImage && (
                  <img
                    src={course.lecturerImage}
                    alt={course.lecturerName || "Lecturer"}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    Lecturer
                  </span>
                  <span className="font-medium text-nav">
                    {course.lecturerName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <span>
                  <b>{course.enrollmentCount}</b> students enrolled
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand" />
                <span className="flex flex-col">
                  <span>
                    <b>Term:</b> {course.term}
                  </span>
                  {termStartLabel && termEndLabel && (
                    <span className="text-xs text-muted">
                      {termStartLabel} – {termEndLabel}
                    </span>
                  )}
                </span>
              </div>

              {course.department && (
                <div>
                  <b>Department:</b> {course.department}
                </div>
              )}

              <div>
                <b>Unique Code:</b> {course.uniqueCode}
              </div>

              <div>
                <b>Created at:</b> {createdAtLabel}
              </div>
            </CardContent>
          </Card>

          {/* Syllabus */}
          <Card className="card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nav">
                Syllabus
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {syllabusUrl ? (
                <a
                  href={syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  View syllabus file
                </a>
              ) : (
                <p className="text-muted text-sm">No syllabus file uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
