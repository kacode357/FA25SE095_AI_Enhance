// app/student/courses/[id]/my-groups/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMyGroups } from "@/hooks/group/useMyGroups";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ListChecks,
  Users,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Eye,
  Crown,
  BookOpen,
  FileText,
} from "lucide-react";

export default function MyGroupsByCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params?.id === "string" ? params.id : "";

  const { loading, groups, total, fetchMyGroups } = useMyGroups();

  useEffect(() => {
    if (courseId) fetchMyGroups(courseId);
  }, [courseId, fetchMyGroups]);

  const courseName = useMemo(() => groups[0]?.courseName ?? "", [groups]);
  const empty = !loading && (!groups || groups.length === 0);

  const onRefresh = () => {
    if (!courseId) return;
    fetchMyGroups(courseId);
  };

  if (!courseId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
        <BookOpen className="w-8 h-8 text-slate-400" />
        <p>
          Không tìm thấy <b>courseId</b> trong đường dẫn.
        </p>
        <Button variant="outline" onClick={() => router.push("/student/my-courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-green-600" />
          My Groups
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/student/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <Button variant="secondary" onClick={onRefresh}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Nhóm của bạn trong khóa học</CardTitle>
              <p className="text-xs text-slate-500">
                {courseName ? <b>{courseName}</b> : "This course"} • {total} group
                {total > 1 ? "s" : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onRefresh} className="text-slate-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-10 text-green-700">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading my groups…</span>
            </div>
          )}

          {/* Empty */}
          {empty && (
            <div className="flex flex-col items-center py-10 text-slate-600">
              <Users className="w-10 h-10 text-slate-400 mb-2" />
              <p className="mb-3 text-sm text-center">
                Bạn chưa tham gia nhóm nào trong khóa học này.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/student/courses/${courseId}/groups`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem danh sách nhóm
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          {!loading && !empty && (
            <ul className="space-y-4">
              {groups.map((g) => {
                const locked = g.isLocked;
                const canViewAssignment = !!g.assignmentId;

                return (
                  <li key={g.groupId}>
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      {/* === Row 1: TL + TR === */}
                      <div className="px-4 pt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* TL */}
                        <div className="md:col-span-7 min-w-0 flex items-center gap-3">
                          <span
                            className={
                              "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border shrink-0 " +
                              (locked
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200")
                            }
                            title={locked ? "Group is locked" : "Group is open"}
                          >
                            {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {locked ? "Locked" : "Open"}
                          </span>
                          <h3 className="text-base font-semibold text-slate-900 truncate">
                            {g.groupName}
                          </h3>
                        </div>

                        {/* TR */}
                        <div className="md:col-span-5 min-w-0 flex items-center justify-start md:justify-end gap-2 flex-wrap">
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 inline-flex items-center gap-1 shrink-0">
                            {g.isLeader ? (
                              <>
                                <Crown className="w-3 h-3" /> Leader
                              </>
                            ) : (
                              g.role || "Member"
                            )}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/student/courses/${g.courseId}/groups/${g.groupId}`)
                            }
                            className="shrink-0"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View group
                          </Button>
                        </div>
                      </div>

                      {/* === Row 2: BL + BR === */}
                      <div className="px-4 pb-4 pt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* BL */}
                        <div className="md:col-span-7 min-w-0 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-4 h-4 text-green-600" />
                              <b>{g.memberCount}</b> / {g.maxMembers} members
                            </span>
                            <span className="text-xs text-slate-500">
                              Joined: {new Date(g.joinedAt).toLocaleString("en-GB")}
                            </span>
                          </div>

                          {g.description && (
                            <p className="text-sm text-slate-600 line-clamp-2 break-words">
                              {g.description}
                            </p>
                          )}

                          {(g.courseName || g.courseCode) && (
                            <p className="text-xs text-slate-500">
                              Course: <b>{g.courseName}</b>
                              {g.courseCode ? ` (${g.courseCode})` : ""}
                            </p>
                          )}
                        </div>

                        {/* BR: ASSIGNMENT HIGHLIGHT */}
                        <div className="md:col-span-5 min-w-0">
                          {canViewAssignment ? (
                            <div className="w-full max-w-full rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                  <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                                      Assignment
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/student/courses/${g.courseId}/assignments/${g.assignmentId}`
                                        )
                                      }
                                      className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline break-words line-clamp-2 text-left"
                                      title={g.assignmentTitle || "View assignment"}
                                    >
                                      {g.assignmentTitle}
                                    </button>
                                  </div>
                                </div>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/student/courses/${g.courseId}/assignments/${g.assignmentId}`
                                    )
                                  }
                                  className="shrink-0"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                              <div className="flex items-start gap-2 text-slate-500">
                                <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs uppercase tracking-wide font-semibold">
                                    Assignment
                                  </p>
                                  <p className="text-sm truncate">—</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
  );
}
