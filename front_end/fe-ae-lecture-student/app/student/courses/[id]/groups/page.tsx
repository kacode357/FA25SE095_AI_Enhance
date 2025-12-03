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
  ArrowLeft,
  FileText,
  ChevronRight,
} from "lucide-react";
// Đã xóa import parseCourseName

export default function CourseGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params?.id === "string" ? params.id : "";

  // Groups
  const { listData, loading, fetchByCourseId } = useGroupsByCourseId();

  // Students (sidebar)
  const {
    loading: loadingStudents,
    students,
    totalStudents,
    courseName, // Dùng trực tiếp cái này
    fetchCourseStudents,
  } = useCourseStudents(courseId);

  useEffect(() => {
    if (!courseId) return;
    fetchByCourseId(courseId);
    fetchCourseStudents(courseId);
  }, [courseId, fetchByCourseId, fetchCourseStudents]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-brand">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading groups…</span>
      </div>
    );
  }

  const isEmpty = !listData || listData.length === 0;

  // Đã xóa logic parseCourseName

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-brand flex items-center gap-2">
            <Users className="w-6 h-6 text-brand" />
            Groups
          </h1>
        
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
              </CardContent>
            </Card>
          ) : (
            <Card className="card rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[color:var(--foreground)]">
                  Group List
                </CardTitle>
                <p className="text-xs text-[color:var(--text-muted)]">
                  {listData.length} group
                  {listData.length > 1 ? "s" : ""} • Select a group to view
                  details
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="divide-y divide-[color:var(--border)]">
                  {listData.map((g) => {
                    const locked = g.isLocked;
                    const memberLabel =
                      g.maxMembers == null
                        ? `${g.memberCount} ${
                            g.memberCount === 1 ? "member" : "members"
                          }`
                        : `${g.memberCount}/${g.maxMembers} ${
                            g.maxMembers === 1 ? "member" : "members"
                          }`;

                    return (
                      <li
                        key={g.id}
                        onClick={() =>
                          router.push(
                            `/student/courses/${courseId}/groups/${g.id}`
                          )
                        }
                        className="group flex items-center justify-between gap-4 py-4 px-3 rounded-lg transition-colors hover:bg-[color:var(--brand)]/5 cursor-pointer"
                      >
                        {/* LEFT: Main info */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Name + Status */}
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="font-semibold text-base text-[color:var(--foreground)]">
                              {g.name}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                locked
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }`}
                            >
                              {locked ? (
                                <>
                                  <Lock className="w-3 h-3" /> Locked
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" /> Open
                                </>
                              )}
                            </span>
                          </div>

                          {/* Row 2: Metadata (Created, Leader, Members) */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--text-muted)]">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {memberLabel}
                            </span>

                            {g.leaderName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                <span>
                                  Leader: <b>{g.leaderName}</b>
                                </span>
                              </span>
                            )}

                            {g.assignmentTitle && (
                              <span className="truncate max-w-[200px]">
                                Assign: <b>{g.assignmentTitle}</b>
                              </span>
                            )}
                          </div>

                          {/* Row 3: Description (optional) */}
                          {g.description && (
                            <p className="mt-1.5 text-xs text-[color:var(--text-muted)] line-clamp-1">
                              {g.description}
                            </p>
                          )}
                        </div>

                        {/* Icon Next bên phải */}
                        <div className="shrink-0 text-[color:var(--muted)] group-hover:text-brand transition-colors">
                          <ChevronRight className="w-5 h-5" />
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
                  Students
                </CardTitle>
              </div>
              <p className="text-xs text-[color:var(--text-muted)]">
                <span>{totalStudents} students in class</span>
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