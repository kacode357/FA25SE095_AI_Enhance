// app/student/dashboard/components/DashboardCurrentCourses.tsx
"use client";

import { useEffect, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

import { useStudentCurrentCourses } from "@/hooks/dashboard/useStudentCurrentCourses";

interface DashboardCurrentCoursesProps {
  termId?: string;
}

export default function DashboardCurrentCourses({ termId }: DashboardCurrentCoursesProps) {
  const { data, loading, fetchCurrentCourses } = useStudentCurrentCourses();
  const router = useRouter();

  useEffect(() => {
    if (!termId) return;
    fetchCurrentCourses(termId);
  }, [termId]);

  const courses = data?.data.courses ?? [];

  const handleGoCourse = useCallback(
    (courseId: string) => {
      if (!courseId) return;
      router.push(`/student/courses/${courseId}`);
    },
    [router],
  );

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Current Courses
        </CardTitle>
        <BookOpen className="h-4 w-4 text-violet-500" />
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <CoursesSkeleton />
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses yet.</p>
        ) : (
          courses.slice(0, 4).map((c) => (
            <div
              key={c.courseId}
              role="button"
              tabIndex={0}
              onClick={() => handleGoCourse(c.courseId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleGoCourse(c.courseId);
                }
              }}
              className="cursor-pointer rounded border border-indigo-100 bg-white/80 px-3 py-2 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <div className="flex justify-between gap-2">
                <span className="max-w-[70%] truncate font-semibold text-nav">
                  {c.courseName}
                </span>
                <span className="text-indigo-700 font-semibold">
                  {c.courseCode}
                </span>
              </div>

              <div className="mt-1 text-slate-600">
                Lecturer: <span className="font-semibold text-nav">{c.lecturerName || "N/A"}</span>
              </div>

              <div className="mt-1 text-slate-600">
                Pending:{" "}
                <span className="font-semibold text-amber-700">
                  {c.pendingAssignments}
                </span>{" "}
                /{" "}
                <span className="font-semibold text-nav">
                  {c.totalAssignments}
                </span>
              </div>

              <div className="mt-1 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Progress</span>
                  <span className="font-semibold text-nav">
                    {(c.progressPercentage ?? 0).toFixed(2)}%
                  </span>
                </div>
                <Progress value={c.progressPercentage ?? 0} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CoursesSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
