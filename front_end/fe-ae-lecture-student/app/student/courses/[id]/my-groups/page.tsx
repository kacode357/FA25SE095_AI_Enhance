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
  Loader2,
  ArrowLeft,
  Eye,
  Crown,
  BookOpen,
  FileText,
  RefreshCw,
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
      <div className="flex flex-col items-center gap-3 py-16 text-slate-600 px-4 sm:px-6 lg:px-8">
        <BookOpen className="w-8 h-8 text-slate-400" />
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

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-green-600" />
            My Groups
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Course: <b>{courseName || "—"}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/student/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
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

      {/* Wrapper */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Your Groups</CardTitle>
              <p className="text-xs text-slate-500">Total: <b>{total}</b> group{total > 1 ? "s" : ""}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-10 text-green-700">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading your groups…</span>
            </div>
          )}

          {/* Empty */}
          {empty && (
            <div className="flex flex-col items-center py-10 text-slate-600">
              <Users className="w-10 h-10 text-slate-400 mb-2" />
              <p className="mb-3 text-sm text-center">
                You haven't joined any groups in this course.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/student/courses/${courseId}/groups`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View available groups
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          {!loading && !empty && (
            <ul className="space-y-3">
              {groups.map((g) => {
                const canViewAssignment = !!g.assignmentId;

                // Member label
                const membersLabel =
                  g.maxMembers === null || g.maxMembers === undefined
                    ? `${g.memberCount} ${g.memberCount === 1 ? "member" : "members"}`
                    : `${g.memberCount}/${g.maxMembers} ${g.maxMembers === 1 ? "member" : "members"}`;

                return (
                  <li key={g.groupId}>
                    <div
                      className="
                        group relative rounded-xl border border-slate-200 bg-white
                        hover:border-emerald-200 hover:bg-emerald-50/30
                        transition-colors shadow-sm
                      "
                    >
                      {/* Top row: name + role + actions */}
                      <div className="px-4 pt-4 pb-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Left block */}
                        <div className="md:col-span-7 flex items-center gap-3 min-w-0">
                          {/* Only show Locked (no “Open”) */}
                          {g.isLocked && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border bg-red-50 text-red-700 border-red-200 shrink-0"
                              title="Group is locked"
                            >
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}

                          <h3 className="text-base font-semibold text-slate-900 truncate">
                            {g.groupName}
                          </h3>

                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 inline-flex items-center gap-1 shrink-0">
                            {g.isLeader ? (
                              <>
                                <Crown className="w-3 h-3" /> Leader
                              </>
                            ) : (
                              g.role || "Member"
                            )}
                          </span>
                        </div>

                        {/* Right block: actions align right */}
                        <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-2">
                          {canViewAssignment && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/student/courses/${g.courseId}/assignments/${g.assignmentId}`)
                              }
                              className="shrink-0"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View assignment
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/student/courses/${g.courseId}/groups/${g.groupId}`)}
                            className="shrink-0"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View group
                          </Button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100" />

                      {/* Bottom row: meta & description, layout clean */}
                      <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Meta chips */}
                        <div className="md:col-span-12 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Users className="w-4 h-4 text-green-600" />
                            {membersLabel}
                          </span>

                          {g.assignmentTitle && (
                            <button
                              type="button"
                              onClick={() =>
                                canViewAssignment &&
                                router.push(`/student/courses/${g.courseId}/assignments/${g.assignmentId}`)
                              }
                              className={
                                "truncate max-w-[60ch] underline-offset-2 " +
                                (canViewAssignment
                                  ? "text-slate-700 hover:underline"
                                  : "text-slate-400 cursor-not-allowed")
                              }
                              title={g.assignmentTitle || "Assignment"}
                              disabled={!canViewAssignment}
                            >
                              <span className="text-slate-500 mr-1">Assignment:</span>
                              <b className="text-slate-800">{g.assignmentTitle}</b>
                            </button>
                          )}

                          <span className="text-xs text-slate-500">
                            Joined: {new Date(g.joinedAt).toLocaleString("en-GB")}
                          </span>
                        </div>

                        {/* Description (optional) */}
                        {g.description && (
                          <div className="md:col-span-12">
                            <p className="text-sm text-slate-600 line-clamp-2">{g.description}</p>
                          </div>
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
  );
}
