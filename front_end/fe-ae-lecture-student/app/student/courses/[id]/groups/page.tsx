// app/student/courses/[id]/groups/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  ArrowLeft,
  FileText,
  Eye,
} from "lucide-react";

export default function CourseGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params?.id === "string" ? params.id : "";

  // 🔹 Groups
  const { listData, loading, fetchByCourseId, refetch } = useGroupsByCourseId();

  // 🔹 Students (sidebar 30%)
  const {
    loading: loadingStudents,
    students,
    totalStudents,
    courseName,
    fetchCourseStudents,
  } = useCourseStudents();

  useEffect(() => {
    if (courseId) {
      fetchByCourseId(courseId);
      fetchCourseStudents(courseId);
    }
  }, [courseId, fetchByCourseId, fetchCourseStudents]);

  const onRefresh = () => {
    if (!courseId) return;
    refetch(courseId);
    fetchCourseStudents(courseId);
  };

  if (!courseId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
        <FileText className="w-8 h-8 text-slate-400" />
        <p>
          Could not find <b>courseId</b> in the path.
        </p>
        <Button variant="outline" onClick={() => router.push("/student/my-courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  // ⏳ Total Loading (prioritizing groups)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-green-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading groups…</span>
      </div>
    );
  }

  const isEmpty = !listData || listData.length === 0;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          Groups
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/student/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <Button variant="secondary" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main layout 7/3 → grid 10 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: 7 parts = col-span-7 */}
        <div className="lg:col-span-7">
          {isEmpty ? (
            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
              <CardContent className="py-10 text-center text-slate-600">
                <Users className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                <p className="mb-4">No groups available for this course yet.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={onRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Group List</CardTitle>
                <p className="text-xs text-slate-500">
                  {listData.length} group{listData.length > 1 ? "s" : ""} • Click to view members
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="divide-y divide-slate-200">
                  {listData.map((g) => {
                    const locked = g.isLocked;
                    return (
                      <li
                        key={g.id}
                        className="group flex items-start gap-4 py-4 px-1 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {/* Status */}
                        <div className="mt-1 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${
                              locked
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {locked ? (
                              <>
                                <Lock className="w-3 h-3" />
                                Locked
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                Open
                              </>
                            )}
                          </span>
                        </div>

                        {/* Main info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900">{g.name}</p>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                Created: {new Date(g.createdAt).toLocaleString("en-GB")}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/student/courses/${courseId}/groups/${g.id}`)
                                }
                                className="shrink-0"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View members
                              </Button>
                            </div>
                          </div>

                          {/* Sub info row */}
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-green-600" />
                              <b>{g.memberCount}</b> / {g.maxMembers} members
                            </span>

                            {g.leaderName && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4 text-slate-500" />
                                Lead: <b className="ml-1">{g.leaderName}</b>
                              </span>
                            )}

                            {g.assignmentTitle && (
                              <span className="text-slate-600">
                                Assignment: <b>{g.assignmentTitle}</b>
                              </span>
                            )}
                          </div>

                          {/* Description (clamp 2 lines) */}
                          {g.description && (
                            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                              {g.description}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: 3 parts = col-span-3 */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Students in this class</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => courseId && fetchCourseStudents(courseId)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {loadingStudents ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {courseName ? <b>{courseName}</b> : "Course"} • <span>{totalStudents} students</span>
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              {/* List students */}
              <div className="max-h-[70vh] overflow-auto pr-1">
                {loadingStudents && (
                  <div className="flex items-center gap-2 text-slate-500 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading students…</span>
                  </div>
                )}

                {!loadingStudents && students.length === 0 && (
                  <div className="text-sm text-slate-500 py-4">No students found.</div>
                )}

                <ul className="space-y-3">
                  {students.map((s) => (
                    <li
                      key={s.enrollmentId}
                      className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:bg-slate-50"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        {s.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.profilePictureUrl}
                            alt={s.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                            {getInitials(s.fullName)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{s.fullName}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 shrink-0">
                            {s.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{s.email}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>ID: {s.studentIdNumber || "—"}</span>
                          <span>Joined: {new Date(s.joinedAt).toLocaleDateString("en-GB")}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ===== Helpers ===== */
function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}