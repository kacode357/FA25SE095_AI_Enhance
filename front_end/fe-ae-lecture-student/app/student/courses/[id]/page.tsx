// app/student/courses/[id]/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  Users,
  ArrowLeft,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// Button của shadcn để lại, nhưng tao style theo globals.css ở className
import { Button } from "@/components/ui/button";

import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useAssignments } from "@/hooks/assignment/useAssignments";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import Link from "next/link";

/* ===== Helpers (màu theo globals.css) ===== */
const badgeStyle = (bg: string, fg: string) => ({
  background: bg,
  color: fg,
  border: "1px solid var(--border)",
});
const statusBadge = (s: AssignmentStatus) => {
  switch (s) {
    case AssignmentStatus.Draft:
      return badgeStyle("rgba(148,163,184,0.10)", "var(--foreground)");
    case AssignmentStatus.Active:
      return badgeStyle("rgba(127,113,244,0.10)", "var(--brand)");
    case AssignmentStatus.Extended:
      return badgeStyle("rgba(244,162,59,0.10)", "var(--accent)");
    case AssignmentStatus.Overdue:
      return badgeStyle("rgba(220,38,38,0.08)", "#b91c1c");
    case AssignmentStatus.Closed:
    default:
      return badgeStyle("rgba(15,23,42,0.06)", "var(--text-muted)");
  }
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  const { data: course, loading: loadingCourse, error, fetchCourseById } = useGetCourseById();
  const { listData, loading: loadingAssignments, fetchAssignments } = useAssignments();

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

  if (!courseId) {
    return (
      <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
        <p>Không tìm thấy <b>courseId</b> trong URL.</p>
        <button
          className="btn mt-4"
          style={{ background: "var(--card)", color: "var(--brand)", border: "1px solid var(--brand)" }}
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
      <div className="flex items-center justify-center h-[60vh]" style={{ color: "var(--brand)" }}>
        <BookOpen className="w-6 h-6 mr-2 animate-pulse" />
        <span className="text-sm">Loading course…</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <BookOpen className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--muted)" }} />
        <p>{error || "Course not found."}</p>
        <button
          onClick={() => router.push("/student/my-courses")}
          className="btn mt-4"
          style={{ background: "var(--card)", color: "var(--brand)", border: "1px solid var(--brand)" }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-nav">
            <BookOpen className="w-7 h-7 text-brand" />
            {course.courseCode} - {course.lecturerName} - {course.term} {course.year}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/student/my-courses")}
          className="border-brand text-brand hover:bg-[color:var(--brand)]/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* GRID 7-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: Assignments */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="rounded-2xl shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <ListTodo className="w-5 h-5 text-brand" />
                Assignments {totalAssignments > 0 && (
                  <span className="ml-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    ({totalAssignments})
                  </span>
                )}
              </CardTitle>

              <div className="flex items-center gap-2">
                <button
                  className="btn h-9"
                  style={{ background: "var(--brand)", color: "var(--white)", borderRadius: 10 }}
                  onClick={() =>
                    fetchAssignments({ courseId, sortBy: "DueDate", sortOrder: "asc", pageNumber: 1, pageSize: 10, isUpcoming: true })
                  }
                  title="Upcoming"
                >
                  <Clock className="w-4 h-4" />
                  Upcoming
                </button>

                <button
                  className="btn h-9"
                  style={{ background: "var(--accent)", color: "var(--white)", borderRadius: 10 }}
                  onClick={() =>
                    fetchAssignments({ courseId, sortBy: "DueDate", sortOrder: "asc", pageNumber: 1, pageSize: 10, isOverdue: true })
                  }
                  title="Overdue"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Overdue
                </button>

                <button
                  className="btn h-9"
                  style={{ background: "var(--card)", color: "var(--brand)", border: "1px solid var(--brand)", borderRadius: 10 }}
                  onClick={() =>
                    fetchAssignments({ courseId, sortBy: "DueDate", sortOrder: "asc", pageNumber: 1, pageSize: 10 })
                  }
                  title="Reset"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              {loadingAssignments ? (
                <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
                  Loading assignments…
                </div>
              ) : assignments.length === 0 ? (
                <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
                  There are no assignments for this course yet.
                </div>
              ) : (
                <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {assignments.map((a) => {
                    const due = new Date(a.dueDate);
                    const extended = a.extendedDueDate ? new Date(a.extendedDueDate) : null;
                    const finalDue = extended ?? due;
                    const dueLabel = extended ? "Extended due" : "Due";
                    const href = `/student/courses/${courseId}/assignments/${a.id}`;

                    return (
                      <li key={a.id} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          {/* Left: Title + meta */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={href}
                                className="font-bold text-lg no-underline hover:underline"
                                style={{ color: "var(--nav-active)" }}
                              >
                                {a.title}
                              </Link>

                              <span
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md"
                                style={statusBadge(a.status)}
                                title={a.statusDisplay}
                              >
                                {a.status === AssignmentStatus.Active && <CheckCircle2 className="w-3 h-3" />}
                                {a.statusDisplay}
                              </span>

                              {a.isGroupAssignment && (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md"
                                  style={badgeStyle("rgba(127,113,244,0.10)", "var(--brand)")}
                                >
                                  <Users className="w-3 h-3" />
                                  Group
                                </span>
                              )}
                            </div>

                            <div className="mt-1 text-sm flex items-center gap-4 flex-wrap" style={{ color: "var(--text-muted)" }}>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4 text-brand" />
                                {dueLabel}: <b className="ml-1" style={{ color: "var(--foreground)" }}>{finalDue.toLocaleString("en-GB")}</b>
                              </span>
                              {typeof a.maxPoints === "number" && (
                                <span>Points: <b style={{ color: "var(--foreground)" }}>{a.maxPoints}</b></span>
                              )}
                              {typeof a.assignedGroupsCount === "number" && a.isGroupAssignment && (
                                <span>Groups: <b style={{ color: "var(--foreground)" }}>{a.assignedGroupsCount}</b></span>
                              )}
                              {a.isOverdue && (
                                <span className="flex items-center gap-1" style={{ color: "#b91c1c" }}>
                                  <AlertTriangle className="w-4 h-4" /> Overdue
                                </span>
                              )}
                              {!a.isOverdue && a.daysUntilDue >= 0 && (
                                <span className="font-medium" style={{ color: "var(--brand)" }}>
                                  {a.daysUntilDue} day{a.daysUntilDue === 1 ? "" : "s"} left
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Right actions: bỏ nút View, dùng Title làm link */}
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
          <Card className="rounded-2xl shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <CardHeader>
              <CardTitle className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3" style={{ color: "var(--foreground)" }}>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <span><b>{course.enrollmentCount}</b> students enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand" />
                <span><b>Term:</b> {course.term} ({course.year})</span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="rounded-2xl shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <CardHeader>
              <CardTitle className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="whitespace-pre-line" style={{ color: "var(--text-muted)" }}>
                {course.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card className="rounded-2xl shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <CardHeader>
              <CardTitle className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3" style={{ color: "var(--foreground)" }}>
              {course.requiresAccessCode && (
                <div>
                  <b>Access Code:</b>{" "}
                  {course.isAccessCodeExpired ? (
                    <span className="font-semibold" style={{ color: "#b91c1c" }}>Expired</span>
                  ) : (
                    <span className="font-semibold" style={{ color: "var(--brand)" }}>Active</span>
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
        </div>
      </div>
    </motion.div>
  );
}
