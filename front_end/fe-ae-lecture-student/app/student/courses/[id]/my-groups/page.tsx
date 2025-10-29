// app/student/courses/[id]/my-groups/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMyGroups } from "@/hooks/group/useMyGroups";
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
import Button from "@/components/ui/button";

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
      <div className="flex flex-col items-center gap-3 py-16 text-center px-4 sm:px-6 lg:px-8">
        <BookOpen className="w-8 h-8 text-nav-active" />
        <p className="text-nav">
          Không tìm thấy <b>courseId</b> trên URL.
        </p>
        <button
          className="btn bg-white border border-brand text-brand"
          onClick={() => router.push("/student/my-courses")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-nav flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-nav-active" />
            My Groups
          </h1>
          <p className="text-sm text-nav">
            Course: <b className="text-brand">{courseName || "—"}</b>
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

          <button
            className={`btn btn-gradient-slow ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Wrapper */}
      <div className="card rounded-2xl p-0">
        {/* Card header */}
        <div className="px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-nav">Your Groups</h2>
            <p className="text-xs text-nav">
              Total: <b className="text-brand">{total}</b> group{total > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Card content */}
        <div className="px-4 sm:px-6 py-4">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand" />
              <span className="text-sm text-nav">Loading your groups…</span>
            </div>
          )}

          {/* Empty */}
          {empty && (
            <div className="flex flex-col items-center py-10 text-center">
              <Users className="w-10 h-10 text-nav-active mb-2" />
              <p className="mb-4 text-sm text-nav">Bạn chưa tham gia nhóm nào trong khoá này.</p>
              <div className="flex gap-2">
                <button
                  className="btn btn-gradient"
                  onClick={() => router.push(`/student/courses/${courseId}/groups`)}
                >
                  <Eye className="w-4 h-4" />
                  View available groups
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {!loading && !empty && (
            <ul className="space-y-3">
              {groups.map((g: any) => {
                const canViewAssignment = !!g.assignmentId;
                const membersLabel =
                  g.maxMembers === null || g.maxMembers === undefined
                    ? `${g.memberCount} ${g.memberCount === 1 ? "member" : "members"}`
                    : `${g.memberCount}/${g.maxMembers} ${g.maxMembers === 1 ? "member" : "members"
                    }`;

                return (
                  <li key={g.groupId}>
                    <div
                      className="
                        card relative rounded-xl
                        transition-all hover:shadow-md
                      "
                    >
                      {/* Top row */}
                      <div className="px-4 pt-4 pb-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Left */}
                        <div className="md:col-span-7 flex items-center gap-3 min-w-0">
                          {g.isLocked && (
                            <span
                              title="Group is locked"
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-accent text-accent shrink-0"
                            >
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}

                          <h3 className="text-base font-semibold text-nav truncate">
                            {g.groupName}
                          </h3>

                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-brand text-brand inline-flex items-center gap-1 shrink-0">
                            {g.isLeader ? (
                              <>
                                <Crown className="w-3 h-3" /> Leader
                              </>
                            ) : (
                              g.role || "Member"
                            )}
                          </span>
                        </div>

                        {/* Right actions */}
                        <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-2">
                          {canViewAssignment && (
                            <button
                              className="btn bg-white border border-brand text-brand"
                              onClick={() =>
                                router.push(
                                  `/student/courses/${g.courseId}/assignments/${g.assignmentId}`
                                )
                              }
                            >
                              <FileText className="w-4 h-4" />
                              View assignment
                            </button>
                          )}

                          <button
                            className="btn btn-gradient"
                            onClick={() =>
                              router.push(`/student/courses/${g.courseId}/groups/${g.groupId}`)
                            }
                          >
                            <Eye className="w-4 h-4" />
                            View group
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100" />

                      {/* Bottom row */}
                      <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Meta */}
                        <div className="md:col-span-12 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-1 text-nav">
                            <Users className="w-4 h-4 text-brand" />
                            {membersLabel}
                          </span>

                          {g.assignmentTitle && (
                            <button
                              type="button"
                              onClick={() =>
                                canViewAssignment &&
                                router.push(
                                  `/student/courses/${g.courseId}/assignments/${g.assignmentId}`
                                )
                              }
                              className={`truncate max-w-[60ch] underline-offset-2 ${canViewAssignment
                                  ? "text-nav hover:underline"
                                  : "opacity-60 cursor-not-allowed"
                                }`}
                              title={g.assignmentTitle || "Assignment"}
                              disabled={!canViewAssignment}
                            >
                              <span className="opacity-70 mr-1">Assignment:</span>
                              <b className="text-brand">{g.assignmentTitle}</b>
                            </button>
                          )}

                          <span className="text-xs opacity-70">
                            Joined: {new Date(g.joinedAt).toLocaleString("en-GB")}
                          </span>
                        </div>

                        {/* Description */}
                        {g.description && (
                          <div className="md:col-span-12">
                            <p className="text-sm opacity-90 line-clamp-2">{g.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
