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

  // Groups
  const { listData, loading, fetchByCourseId, refetch } = useGroupsByCourseId();

  // Students (sidebar)
  const {
    loading: loadingStudents,
    students,
    totalStudents,
    courseName,
    fetchCourseStudents,
  } = useCourseStudents();

  useEffect(() => {
    if (!courseId) return;
    fetchByCourseId(courseId);
    fetchCourseStudents(courseId);
  }, [courseId, fetchByCourseId, fetchCourseStudents]);

  const onRefresh = () => {
    if (!courseId) return;
    refetch(courseId);
    fetchCourseStudents(courseId);
  };

  if (!courseId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-4 sm:px-6 lg:px-8 text-[color:var(--text-muted)]">
        <FileText className="w-8 h-8 text-[color:var(--muted)]" />
        <p>
          Could not find <b>courseId</b> in the path.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/student/my-courses")}
          className="border-brand text-brand hover:bg-[color:var(--brand)]/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  // Prioritize groups loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-brand">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading groups…</span>
      </div>
    );
  }

  const isEmpty = !listData || listData.length === 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-brand flex items-center gap-2">
            <Users className="w-6 h-6 text-brand" />
            Groups
          </h1>
          <p className="text-xs text-[color:var(--text-muted)] mt-1">
            Course: <b className="text-[color:var(--foreground)]">{courseName || "—"}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="border-brand text-brand hover:bg-[color:var(--brand)]/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <Button onClick={onRefresh} className="btn btn-gradient-slow px-4 py-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main layout 7/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: groups list */}
        <div className="lg:col-span-7">
          {isEmpty ? (
            <Card className="card rounded-2xl">
              <CardContent className="py-10 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-[color:var(--muted)]" />
                <p className="mb-4 text-[color:var(--text-muted)]">
                  No groups available for this course yet.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={onRefresh}
                    className="border-brand text-brand hover:bg-[color:var(--brand)]/5"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[color:var(--foreground)]">
                  Group List
                </CardTitle>
                <p className="text-xs text-[color:var(--text-muted)]">
                  {listData.length} group{listData.length > 1 ? "s" : ""} • Click to view members
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="divide-y divide-[color:var(--border)]">
                  {listData.map((g) => {
                    const locked = g.isLocked;

                    const memberLabel =
                      g.maxMembers == null
                        ? `${g.memberCount} ${g.memberCount === 1 ? "member" : "members"}`
                        : `${g.memberCount}/${g.maxMembers} ${
                            g.maxMembers === 1 ? "member" : "members"
                          }`;

                    return (
                      <li
                        key={g.id}
                        className="group flex items-start gap-4 py-4 px-1 rounded-lg transition-colors hover:bg-[color:var(--brand)]/3"
                      >
                        {/* Status chip */}
                        <div className="mt-1 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${
                              locked
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-[color:var(--brand)]/10 text-brand border-[color:var(--brand)]/30"
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
                            <p className="font-semibold text-[color:var(--foreground)]">
                              {g.name}
                            </p>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[color:var(--text-muted)]">
                                Created: {new Date(g.createdAt).toLocaleString("en-GB")}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/student/courses/${courseId}/groups/${g.id}`)
                                }
                                className="shrink-0 border-brand text-brand hover:bg-[color:var(--brand)]/5"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View members
                              </Button>
                            </div>
                          </div>

                          {/* Sub info row */}
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="flex items-center gap-1 text-[color:var(--foreground)]">
                              <Users className="w-4 h-4 text-brand" />
                              <b>{memberLabel}</b>
                            </span>

                            {g.leaderName && (
                              <span className="flex items-center gap-1 text-[color:var(--text-muted)]">
                                <User className="w-4 h-4 text-[color:var(--muted)]" />
                                Lead:{" "}
                                <b className="ml-1 text-[color:var(--foreground)]">
                                  {g.leaderName}
                                </b>
                              </span>
                            )}

                            {g.assignmentTitle && (
                              <span className="truncate text-[color:var(--text-muted)]">
                                Assignment:{" "}
                                <b className="font-medium text-[color:var(--foreground)]">
                                  {g.assignmentTitle}
                                </b>
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {g.description && (
                            <p className="mt-2 text-sm text-[color:var(--text-muted)] line-clamp-2">
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

        {/* RIGHT: students sidebar */}
        <div className="lg:col-span-3">
          <Card className="card rounded-2xl h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[color:var(--foreground)]">
                  Students in this class
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => courseId && fetchCourseStudents(courseId)}
                  className="text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
                >
                  {loadingStudents ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-[color:var(--text-muted)]">
                {courseName ? (
                  <b className="text-[color:var(--foreground)]">{courseName}</b>
                ) : (
                  "Course"
                )}{" "}
                • <span>{totalStudents} students</span>
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="max-h-[70vh] overflow-auto pr-1">
                {loadingStudents && (
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)] py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading students…</span>
                  </div>
                )}

                {!loadingStudents && students.length === 0 && (
                  <div className="text-sm text-[color:var(--text-muted)] py-4">
                    No students found.
                  </div>
                )}

                <ul className="space-y-3">
                  {students.map((s) => (
                    <li
                      key={s.enrollmentId}
                      className="flex items-center gap-3 p-2 rounded-lg border border-[color:var(--border)] hover:bg-[color:var(--brand)]/3"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[color:var(--border)] shrink-0">
                        {s.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.profilePictureUrl}
                            alt={s.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[color:var(--text-muted)]">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-[color:var(--foreground)] truncate">
                            {s.fullName}
                          </p>
                        </div>
                        <p className="text-xs text-[color:var(--text-muted)] truncate">
                          {s.email}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
                          <span>ID: {s.studentIdNumber || "—"}</span>
                          <span>
                            Joined: {new Date(s.joinedAt).toLocaleDateString("en-GB")}
                          </span>
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
