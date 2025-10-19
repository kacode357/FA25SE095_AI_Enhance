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

// Mày nhớ kiểm tra lại các component này đã được import đúng chưa
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mày nhớ kiểm tra lại các hook và type này đã tồn tại chưa
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useAssignments } from "@/hooks/assignment/useAssignments";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  // Đảm bảo courseId là string, nếu không có thì là rỗng
  const courseId = typeof id === "string" ? id : "";

  // Course info
  const { data: course, loading: loadingCourse, error, fetchCourseById } = useGetCourseById();

  // Assignments
  const { listData, loading: loadingAssignments, fetchAssignments } = useAssignments();

  // Guard để không fetch lặp trong Strict Mode của React (Next.js)
  const didFetchRef = useRef(false);

  useEffect(() => {
    // Nếu không có ID hoặc đã fetch rồi thì dừng
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    // Fetch dữ liệu
    fetchCourseById(courseId);
    fetchAssignments({
      courseId,
      sortBy: "DueDate",
      sortOrder: "asc",
      pageNumber: 1,
      pageSize: 10,
    });
  }, [courseId, fetchCourseById, fetchAssignments]); // dependency đầy đủ

  // Lấy danh sách assignment và tổng số lượng
  const assignments = listData?.assignments ?? [];
  const totalAssignments = listData?.totalCount ?? 0;

  // Hàm helper để định nghĩa màu sắc cho status badge
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

  // --- RENDERING GUARDS ---

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

  // --- MAIN CONTENT ---

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
                {/* Nút lọc Upcoming */}
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
                      isUpcoming: true, // Biến lọc
                    })
                  }
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Upcoming
                </Button>
                {/* Nút lọc Overdue */}
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
                      isOverdue: true, // Biến lọc
                    })
                  }
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Overdue
                </Button>
                {/* Nút Reset (load lại ban đầu) */}
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
                    // Xử lý ngày tháng
                    const due = new Date(a.dueDate);
                    const extended = a.extendedDueDate ? new Date(a.extendedDueDate) : null;
                    const finalDue = extended ?? due;
                    const dueLabel = extended ? "Extended due" : "Due";
                    
                    // Đường dẫn chi tiết Assignment (dùng cho cả Title)
                    const assignmentDetailLink = `/student/courses/${courseId}/assignments/${a.id}`;

                    return (
                      <li key={a.id} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          {/* Left section: Title và Meta data */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* ĐÂY LÀ PHẦN SỬA: Tiêu đề là Link chính */}
                              <Link
                                href={assignmentDetailLink}
                                className="font-bold text-lg text-green-700 hover:text-green-800 hover:underline truncate transition-colors"
                              >
                                {a.title}
                              </Link>

                              {/* Status Badge */}
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

                              {/* Group Badge */}
                              {a.isGroupAssignment && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Users className="w-3 h-3" />
                                  Group
                                </span>
                              )}
                            </div>

                            {/* Meta chi tiết */}
                            <div className="mt-1 text-sm text-slate-500 flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4 text-green-600" />
                                {dueLabel}: <b className="text-slate-700">{finalDue.toLocaleString("en-GB")}</b>
                              </span>
                              {typeof a.maxPoints === "number" && (
                                <span>Points: <b className="text-slate-700">{a.maxPoints}</b></span>
                              )}
                              {typeof a.assignedGroupsCount === "number" && a.isGroupAssignment && (
                                <span>Groups: <b className="text-slate-700">{a.assignedGroupsCount}</b></span>
                              )}
                              {a.isOverdue && (
                                <span className="text-red-600 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" /> Overdue
                                </span>
                              )}
                              {!a.isOverdue && a.daysUntilDue >= 0 && (
                                <span className="text-emerald-700 font-medium">
                                  {a.daysUntilDue} day{a.daysUntilDue === 1 ? "" : "s"} left
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right actions: Đã xóa nút View */}
                          {/* <div className="flex items-center gap-2 shrink-0">
                            // Nút View bị xóa vì đã dùng Title làm link rồi.
                          </div> */}
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