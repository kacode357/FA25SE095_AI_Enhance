"use client";

import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStudentCurrentCourses } from "@/hooks/dashboard/useStudentCurrentCourses";

export default function DashboardCurrentCourses() {
  const { data, loading, fetchCurrentCourses } = useStudentCurrentCourses();

  useEffect(() => {
    fetchCurrentCourses();
  }, []);

  const d = data?.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Current Courses</CardTitle>
        <BookOpen className="h-4 w-4 text-violet-500" />
      </CardHeader>

      <CardContent className="space-y-2">
        {loading || !d ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : d.courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses yet</p>
        ) : (
          d.courses.slice(0, 4).map((c) => (
            <div
              key={c.courseId}
              className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
            >
              <div className="flex justify-between">
                <span className="font-medium">{c.courseName}</span>
                <span className="text-slate-600">{c.courseCode}</span>
              </div>

              <div className="text-slate-500">
                Lecturer: {c.lecturerName} • Grade: {c.currentGrade}
              </div>

              <div className="text-slate-500">
                Pending: {c.pendingAssignments} / {c.totalAssignments}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
