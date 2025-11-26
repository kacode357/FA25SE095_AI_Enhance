// app/student/courses/[id]/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AssignmentStatus } from "@/config/classroom-service/assignment-status.enum";
import { useAssignments } from "@/hooks/assignment/useAssignments";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

/** Safe parse datetime */
const toDate = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

/** Map enum -> CSS class (match app/styles/assignment-status.css) */
const getStatusClass = (s: AssignmentStatus) => {
  switch (s) {
    case AssignmentStatus.Draft:
      return "badge-assignment badge-assignment--draft";
    case AssignmentStatus.Scheduled:
      return "badge-assignment badge-assignment--scheduled";
    case AssignmentStatus.Active:
      return "badge-assignment badge-assignment--active";
    case AssignmentStatus.Extended:
      return "badge-assignment badge-assignment--extended";
    case AssignmentStatus.Overdue:
      return "badge-assignment badge-assignment--overdue";
    case AssignmentStatus.Closed:
      return "badge-assignment badge-assignment--closed";
    case AssignmentStatus.Graded:
      return "badge-assignment badge-assignment--graded";
    default:
      return "badge-assignment badge-assignment--closed";
  }
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

  const {
    listData,
    loading: loadingAssignments,
    fetchAssignments,
  } = useAssignments();

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchCourseById(courseId);
    fetchAssignments({
      courseId,
      sortBy: "DueDate",
      sortOrder: "asc",
      pageNumber: 1,
      pageSize: 10,
    });
  }, [courseId, fetchCourseById, fetchAssignments]);

  const assignments = listData?.assignments ?? [];
  const totalAssignments = listData?.totalCount ?? 0;

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
  const termStartLabel = formatTermDateVN(
    course.termStartDate
  );
  const termEndLabel = formatTermDateVN(
    course.termEndDate
  );

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
            {course.courseCode} - {course.lecturerName} - {course.term}{" "}
            {course.year}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/student/my-courses")}
          className="border-brand text-brand hover:bg-brand/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* GRID 7-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: Assignments */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="card rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-nav">
                <ListTodo className="w-5 h-5 text-brand" />
                <span>Assignments</span>
                {totalAssignments > 0 && (
                  <span className="ml-1 text-xs font-medium text-muted">
                    ({totalAssignments})
                  </span>
                )}
              </CardTitle>

              <div className="flex items-center gap-3">
                {/* Upcoming filter */}
                <button
                  className="btn btn-green-slow h-10 px-4"
                  onClick={() =>
                    fetchAssignments({
                      courseId,
                      sortBy: "DueDate",
                      sortOrder: "asc",
                      pageNumber: 1,
                      pageSize: 10,
                      isUpcoming: true,
                    })
                  }
                  title="Upcoming"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Upcoming</span>
                </button>

                {/* Overdue filter */}
                <button
                  className="btn btn-yellow-slow h-10 px-4"
                  onClick={() =>
                    fetchAssignments({
                      courseId,
                      sortBy: "DueDate",
                      sortOrder: "asc",
                      pageNumber: 1,
                      pageSize: 10,
                      isOverdue: true,
                    })
                  }
                  title="Overdue"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Overdue</span>
                </button>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              {loadingAssignments ? (
                <div className="py-10 text-center text-muted">
                  Loading assignments…
                </div>
              ) : assignments.length === 0 ? (
                <div className="py-10 text-center text-muted">
                  There are no assignments for this course yet.
                </div>
              ) : (
                <ul
                  className="divide-y"
                  style={{ borderColor: "var(--border)" }}
                >
                  {assignments.map((a) => {
                    const due = toDate(a.dueDate);
                    const extended = toDate(a.extendedDueDate);
                    const finalDue = extended ?? due;
                    const dueLabel = extended ? "Extended due" : "Due";
                    const href = `/student/courses/${courseId}/assignments/${a.id}`;

                    const showDaysLeft =
                      !a.isOverdue && typeof a.daysUntilDue === "number";

                    return (
                      <li key={a.id} className="py-4">
                        <div className="flex flex-col gap-2">
                          {/* Row 1: title + status + group  |  days left / overdue */}
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <Link
                                href={href}
                                className="font-bold text-lg no-underline hover:underline text-nav-active"
                              >
                                {a.title}
                              </Link>

                              <span
                                className={getStatusClass(
                                  a.status as AssignmentStatus
                                )}
                                title={a.statusDisplay}
                              >
                                {a.status === AssignmentStatus.Active && (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                {a.statusDisplay}
                              </span>

                              {a.isGroupAssignment && (
                                <span className="badge-assignment badge-assignment--group">
                                  <Users className="w-3 h-3" />
                                  Group
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              {a.isOverdue && (
                                <span className="flex items-center gap-1 text-[#b91c1c] font-medium">
                                  <AlertTriangle className="w-4 h-4" />
                                  Overdue
                                </span>
                              )}
                              {showDaysLeft && a.daysUntilDue >= 0 && (
                                <span className="font-semibold text-brand">
                                  {a.daysUntilDue} day
                                  {a.daysUntilDue === 1 ? "" : "s"} left
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row 2: meta info */}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted">
                            {finalDue && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4 text-brand" />
                                {dueLabel}:{" "}
                                <b className="ml-1 text-nav">
                                  {finalDue.toLocaleString("en-GB")}
                                </b>
                              </span>
                            )}

                            {typeof a.maxPoints === "number" && (
                              <span>
                                Points:{" "}
                                <b className="text-nav">{a.maxPoints}</b>
                              </span>
                            )}

                            {typeof a.assignedGroupsCount === "number" &&
                              a.isGroupAssignment && (
                                <span>
                                  Groups:{" "}
                                  <b className="text-nav">
                                    {a.assignedGroupsCount}
                                  </b>
                                </span>
                              )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Course Details */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
          {/* Overview */}
          <Card className="card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nav">
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
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
                    <b>Term:</b> {course.term} ({course.year})
                  </span>
                  {termStartLabel && termEndLabel && (
                    <span className="text-xs text-muted">
                      {termStartLabel} – {termEndLabel}
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nav">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="whitespace-pre-line text-muted">
                {course.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card className="card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nav">
                Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {course.requiresAccessCode && (
                <div>
                  <b>Access Code:</b>{" "}
                  {course.isAccessCodeExpired ? (
                    <span className="font-semibold text-[#b91c1c]">
                      Expired
                    </span>
                  ) : (
                    <span className="font-semibold text-brand">Active</span>
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
                {formatDateTimeVN(course.createdAt as string)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
