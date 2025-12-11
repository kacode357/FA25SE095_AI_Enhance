"use client";

import { BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { LecturerCoursesOverviewData } from "@/types/dashboard/dashboard.response";

type Props = {
  data?: LecturerCoursesOverviewData;
  loading: boolean;
};

export default function CoursesOverviewCard({ data, loading }: Props) {
  const router = useRouter();
  const courses = data?.courses ?? [];
  const totalCourses = courses.length;
  const avgPendingPerCourse =
    totalCourses > 0
      ? Math.round((data?.totalReportsPendingGrading ?? 0) / totalCourses)
      : 0;
  const avgActivePerCourse =
    totalCourses > 0
      ? Math.round((data?.totalActiveAssignments ?? 0) / totalCourses)
      : 0;
  const avgEnrollmentPerCourse =
    totalCourses > 0
      ? Math.round((data?.totalStudentsEnrolled ?? 0) / totalCourses)
      : 0;

  return (
    <Card className="dashboard-ghost border border-indigo-100 bg-white/80 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Courses overview
        </CardTitle>
        <BookOpen className="h-4 w-4 text-indigo-500" />
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <OverviewSkeleton />
        ) : !data ? (
          <p className="text-sm text-slate-500">No data loaded.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]">
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <StatPill label="Total students" value={data.totalStudentsEnrolled} />
              <StatPill
                label="Reports pending"
                value={data.totalReportsPendingGrading}
                tone="warning"
              />
              <StatPill
                label="Active assignments"
                value={data.totalActiveAssignments}
                tone="info"
              />
              <StatPill
                label="Courses"
                value={totalCourses}
              />
              <StatPill
                label="Avg pending / course"
                value={avgPendingPerCourse}
                tone="warning"
              />
              <StatPill
                label="Avg active / course"
                value={avgActivePerCourse}
                tone="info"
              />
              <StatPill
                label="Avg enrollment / course"
                value={avgEnrollmentPerCourse}
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-nav">Courses</p>
              {courses.slice(0, 4).map((course) => (
                <div
                  key={course.courseId}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-3 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-indigo-100 hover:shadow-md"
                  onClick={() =>
                    router.push(`/lecturer/course/${course.courseId}/course`)
                  }
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-nav">
                        {course.courseName}
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {course.courseCode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                        {course.enrollmentCount} students
                      </span>
                      <span className="text-slate-400">.</span>
                      <span>{course.termName}</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 space-y-1">
                    <div className="font-semibold text-nav">
                      {course.pendingGradingCount} pending
                    </div>
                    <div className="text-slate-500">
                      {course.activeAssignmentsCount} active
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No courses found.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "info";
}) {
  const tones =
    tone === "warning"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : tone === "info"
      ? "bg-sky-50 text-sky-700 border-sky-100"
      : "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <div className={`rounded-lg border px-3 py-3 ${tones}`}>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-nav">{value}</div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
