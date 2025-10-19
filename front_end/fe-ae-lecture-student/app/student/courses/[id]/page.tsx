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
import { Button } from "@/components/ui/button";

import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useAssignments } from "@/hooks/assignment/useAssignments";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  // Course info
  const { data: course, loading: loadingCourse, error, fetchCourseById } = useGetCourseById();

  // Assignments
  const { listData, loading: loadingAssignments, fetchAssignments } = useAssignments();

  // Guard để không fetch lặp trong Strict Mode
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
  }, [courseId]); // chỉ phụ thuộc vào courseId

  const assignments = listData?.assignments ?? [];
  const totalAssignments = listData?.totalCount ?? 0;

  const statusStyle = (s: AssignmentStatus) => {
    switch (s) {
      case AssignmentStatus.Draft:
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case AssignmentStatus.Active:
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case AssignmentStatus.Extended:
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case AssignmentStatus.Overdue:
        return "bg-red-50 text-red-700 border border-red-200";
      case AssignmentStatus.Closed:
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  if (!courseId) {
    return (
      <div className="py-16 text-center text-slate-600">
        <p>Không tìm thấy <b>courseId</b> trong URL.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/student/my-courses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-green-700">
        <BookOpen className="w-6 h-6 mr-2 animate-pulse" />
        <span className="text-sm">Loading course…</span>
      </div>
    );
  }

  if (error || !course) {
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
  }

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
            {course.name}
          </h1>
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

      {/* GRID 7-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: 7/10 — Assignments */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-green-600" />
                Assignments
                {totalAssignments > 0 && (
                  <span className="ml-2 text-xs font-medium text-slate-500">
                    ({totalAssignments})
                  </span>
                )}
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
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
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Upcoming
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Overdue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    fetchAssignments({
                      courseId,
                      sortBy: "DueDate",
                      sortOrder: "asc",
                      pageNumber: 1,
                      pageSize: 10,
                    })
                  }
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              {loadingAssignments ? (
                <div className="py-10 text-center text-slate-600">Loading assignments…</div>
              ) : assignments.length === 0 ? (
                <div className="py-10 text-center text-slate-600">
                  Chưa có assignment nào cho khóa học này.
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {assignments.map((a) => {
                    const due = new Date(a.dueDate);
                    const extended = a.extendedDueDate ? new Date(a.extendedDueDate) : null;
                    const finalDue = extended ?? due;
                    const dueLabel = extended ? "Extended due" : "Due";

                    return (
                      <li key={a.id} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          {/* Left section */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/student/courses/${courseId}/assignments/${a.id}`}
                                className="font-semibold text-slate-900 hover:underline truncate"
                              >
                                {a.title}
                              </Link>

                              <span
                                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${statusStyle(
                                  a.status
                                )}`}
                                title={a.statusDisplay}
                              >
                                {a.status === AssignmentStatus.Active && (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                {a.statusDisplay}
                              </span>

                              {/* Giữ badge Group để biết loại, nhưng KHÔNG có nút/logic view group */}
                              {a.isGroupAssignment && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Users className="w-3 h-3" />
                                  Group
                                </span>
                              )}
                            </div>

                            <div className="mt-1 text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {dueLabel}: {finalDue.toLocaleString("en-GB")}
                              </span>
                              {typeof a.maxPoints === "number" && (
                                <span>Points: <b>{a.maxPoints}</b></span>
                              )}
                              {typeof a.assignedGroupsCount === "number" && a.isGroupAssignment && (
                                <span>Groups: <b>{a.assignedGroupsCount}</b></span>
                              )}
                              {a.isOverdue && (
                                <span className="text-red-600 font-medium">Overdue</span>
                              )}
                              {!a.isOverdue && a.daysUntilDue >= 0 && (
                                <span className="text-emerald-700">
                                  {a.daysUntilDue} day{a.daysUntilDue === 1 ? "" : "s"} left
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right actions — chỉ còn View assignment */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/student/courses/${courseId}/assignments/${a.id}`)
                              }
                            >
                              View
                            </Button>
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

        {/* RIGHT: 3/10 — Course Details */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
          {/* Overview */}
          <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold">Course Overview</CardTitle>
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
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold">Description</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <p className="text-slate-600 whitespace-pre-line">
                {course.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold">Meta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3">
              {course.requiresAccessCode && (
                <div>
                  <b>Access Code:</b>{" "}
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
                <b>Created At:</b> {new Date(course.createdAt).toLocaleString("en-GB")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
