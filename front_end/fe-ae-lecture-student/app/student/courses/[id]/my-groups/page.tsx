// app/student/courses/[id]/my-groups/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMyGroups } from "@/hooks/group/useMyGroups";
import {
  ListChecks,
  Users,
  Loader2,
  ArrowLeft,
  Eye,
  Crown,
  BookOpen,
  FileText,
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

  const empty = !loading && (!groups || groups.length === 0);
  const group = !empty ? groups[0] : null;

  const parsedCourse = useMemo(() => {
    if (!group?.courseName) {
      return {
        raw: "",
        courseCode: "",
        uniqueCode: "",
        lecturerName: "",
      };
    }

    const raw = group.courseName; // ex: "CS101#PYA8S3 - Smith John"
    const [left, lecturerName] = raw.split(" - ");
    const [courseCode, uniqueCode] = (left || "").split("#");

    return {
      raw,
      courseCode: courseCode || "",
      uniqueCode: uniqueCode || "",
      lecturerName: lecturerName || "",
    };
  }, [group]);

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
            My Group
          </h1>

          {/* Course info từ courseName */}
          {parsedCourse.courseCode ? (
            <p className="text-sm text-nav">
              <span className="font-semibold text-brand">
                {parsedCourse.courseCode}
              </span>
              {parsedCourse.uniqueCode && (
                <>
                  {" · "}
                  <span>{parsedCourse.uniqueCode}</span>
                </>
              )}
              {parsedCourse.lecturerName && (
                <>
                  {" · "}
                  <span>{parsedCourse.lecturerName}</span>
                </>
              )}
            </p>
          ) : (
            <p className="text-sm text-nav">
              Course:{" "}
              <b className="text-brand">
                {group?.courseName || "—"}
              </b>
            </p>
          )}
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
        </div>
      </div>

      {/* Wrapper */}
      <div className="card rounded-2xl p-0">
        {/* Card header */}
        <div className="px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-nav">Group & Assignment</h2>
            <p className="text-xs text-nav">
              Total groups joined in this course:{" "}
              <b className="text-brand">{total}</b>
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
              <span className="text-sm text-nav">Loading your group…</span>
            </div>
          )}

          {/* Empty */}
          {empty && (
            <div className="flex flex-col items-center py-10 text-center">
              <Users className="w-10 h-10 text-nav-active mb-2" />
              <p className="mb-4 text-sm text-nav">
                You have not joined any groups in this course.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-gradient"
                  onClick={() =>
                    router.push(`/student/courses/${courseId}/groups`)
                  }
                >
                  <Eye className="w-4 h-4" />
                  View available groups
                </button>
              </div>
            </div>
          )}

          {/* Single group + assignment layout */}
          {!loading && !empty && group && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT: GROUP INFO */}
              <section className="rounded-xl border border-slate-100 bg-white/70 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-lg font-semibold text-nav truncate">
                      {group.groupName}
                    </h3>

                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-brand text-brand inline-flex items-center gap-1 shrink-0">
                      {group.isLeader ? (
                        <>
                          <Crown className="w-3 h-3" /> Leader
                        </>
                      ) : (
                        group.role || "Member"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1 text-nav">
                    <Users className="w-4 h-4 text-brand" />
                    {group.maxMembers == null
                      ? `${group.memberCount} ${
                          group.memberCount === 1 ? "member" : "members"
                        }`
                      : `${group.memberCount}/${group.maxMembers} ${
                          group.maxMembers === 1 ? "member" : "members"
                        }`}
                  </span>

                  <span className="text-xs opacity-70">
                    Joined:{" "}
                    {new Date(group.joinedAt).toLocaleString("en-GB")}
                  </span>
                </div>

                {group.description && (
                  <p className="text-sm opacity-90">
                    {group.description}
                  </p>
                )}

                <div className="mt-auto pt-2">
                  <button
                    className="btn btn-gradient"
                    onClick={() =>
                      router.push(
                        `/student/courses/${group.courseId}/groups/${group.groupId}`
                      )
                    }
                  >
                    <Eye className="w-4 h-4" />
                    Open group room
                  </button>
                </div>
              </section>

              {/* RIGHT: ASSIGNMENT INFO (RÕ LÀ CỦA GROUP NÀY) */}
              <section className="rounded-xl border border-slate-100 bg-white/70 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-nav flex items-center gap-2">
                      <FileText className="w-4 h-4 text-nav-active" />
                      Group assignment
                    </h3>

                    {/* Badge cho user hiểu assignment này gắn với group hiện tại */}
                    <p className="text-xs text-nav opacity-80 inline-flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand" />
                      <span>
                        This assignment belongs to{" "}
                        <span className="font-semibold text-brand">
                          {group.groupName}
                        </span>{" "}
                        (submissions are shared within this group).
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-2 text-left text-base font-semibold text-brand underline-offset-2 hover:underline truncate max-w-[30rem]"
                  onClick={() =>
                    group.assignmentId &&
                    router.push(
                      `/student/courses/${group.courseId}/assignments/${group.assignmentId}`
                    )
                  }
                >
                  {group.assignmentTitle || "View assignment"}
                </button>

                <p className="text-xs text-nav opacity-80">
                  Open this to see the full instructions, deadlines and the
                  submission workspace for your group. Any work you submit here
                  will be counted for <span className="font-semibold">{group.groupName}</span>.
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    className="btn btn-blue-slow"
                    onClick={() =>
                      group.assignmentId &&
                      router.push(
                        `/student/courses/${group.courseId}/assignments/${group.assignmentId}`
                      )
                    }
                  >
                    <FileText className="w-4 h-4" />
                    View group assignment
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
