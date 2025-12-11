// app/student/courses/[id]/components/CourseMiniHeader.tsx
"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";

type Props = {
  section?: string;
};

export function CourseMiniHeader({ section }: Props) {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params?.id === "string" ? params.id : "";

  const { data: course, loading, fetchCourseById } = useGetCourseById();
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!courseId || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchCourseById(courseId);
  }, [courseId, fetchCourseById]);

  if (!courseId) return null;

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3 text-left">
      {loading && !course ? (
        <div className="flex w-full items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : course ? (
        <>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-nav">
                {course.courseCode} · {course.courseCodeTitle || course.name}
              </div>
              {section && (
                <div className="text-xs text-slate-600">
                  Current section:{" "}
                  <span className="font-semibold text-indigo-700">
                    {section}
                  </span>
                </div>
              )}
            </div>
          </div>
      {/* Back button removed per request */}
    </>
  ) : (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          Course info unavailable
        </div>
      )}
    </Card>
  );
}
