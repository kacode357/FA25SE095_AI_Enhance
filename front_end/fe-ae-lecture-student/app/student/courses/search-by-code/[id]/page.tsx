"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Users,
  Loader2,
  GraduationCap,
} from "lucide-react";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { CourseService } from "@/services/course.services";

/** Common datetime formatter – hide invalid year 0001 */
const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || "";
  if (d.getFullYear() < 2000) return "";
  return d.toLocaleDateString("en-GB");
};

export default function CourseSearchResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Course id is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await CourseService.getCourseById(id);
        if (cancelled) return;

        setCourse(res.course ?? res);
      } catch {
        if (cancelled) return;
        setError("Unable to load course. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleGoToCourse = () => {
    if (!course?.id) return;
    router.push(`/student/courses/${course.id}`);
  };

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              <span className="text-sm text-slate-500">
                Loading course information...
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !course && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Course not found.
          </div>
        )}

        {/* Course detail */}
        {!loading && !error && course && (
          <Card className="mt-2 rounded-2xl shadow-sm border border-brand/40">
            {/* HEADER */}
            <CardHeader className="flex flex-col gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <BookOpen className="w-4 h-4" />
                </span>

                <div className="flex-1 space-y-2">
                  {/* Main title: courseCodeTitle only */}
                  <h2 className="text-lg font-semibold text-slate-900 leading-snug">
                    {course.courseCodeTitle || "Untitled course"}
                  </h2>

                  {/* Codes on one line */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    {course.courseCode && (
                      <span>
                        <span className="font-semibold text-slate-500">
                          Course code:
                        </span>{" "}
                        <span className="font-mono font-medium">
                          {course.courseCode}
                        </span>
                      </span>
                    )}

                    {course.uniqueCode && (
                      <span>
                        <span className="font-semibold text-slate-500">
                          Unique code:
                        </span>{" "}
                        <span className="font-mono font-medium">
                          {course.uniqueCode}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* CONTENT */}
            <CardContent className="space-y-4 pt-4">
              {/* Lecturer + meta compact */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Lecturer */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-300 bg-slate-50">
                    <AvatarImage
                      src={course.lecturerImage ?? undefined}
                      alt={course.lecturerName ?? "Lecturer"}
                    />
                    <AvatarFallback className="text-sm font-semibold text-brand">
                      {course.lecturerName
                        ? course.lecturerName.charAt(0).toUpperCase()
                        : "L"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs">
                    <div className="text-slate-500 font-semibold uppercase tracking-wide mb-0.5">
                      Lecturer
                    </div>
                    <div className="flex items-center gap-1 text-slate-900">
                      <GraduationCap className="w-3 h-3 text-slate-500" />
                      <span className="font-medium">
                        {course.lecturerName ?? "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Small stats */}
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>
                      <span className="font-semibold text-slate-500">
                        Students:
                      </span>{" "}
                      <span className="font-medium text-slate-900">
                        {course.enrollmentCount ?? course.studentsCount ?? 0}
                      </span>
                    </span>
                  </div>

                  {(course.term || dt(course.termStartDate) || dt(course.termEndDate)) && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3 h-3 text-slate-500" />
                      <span className="space-x-1">
                        {course.term && (
                          <span>
                            <span className="font-semibold text-slate-500">
                              Term:
                            </span>{" "}
                            <span className="font-medium text-slate-900">
                              {course.term}
                            </span>
                          </span>
                        )}
                        {(dt(course.termStartDate) || dt(course.termEndDate)) && (
                          <>
                            {course.term && <span>·</span>}
                            <span>
                              <span className="font-semibold text-slate-500">
                                Dates:
                              </span>{" "}
                              <span className="font-medium text-slate-900">
                                {dt(course.termStartDate) || "N/A"}
                                {dt(course.termEndDate) &&
                                  ` – ${dt(course.termEndDate)}`}
                              </span>
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description only */}
              {course.description && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Description
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              )}
            </CardContent>

            {/* FOOTER */}
            <CardFooter className="flex items-center justify-end pt-3">
              <Button
                size="sm"
                onClick={handleGoToCourse}
                className="btn-blue-slow text-xs px-4 py-2 rounded-xl"
              >
                <BookOpen className="w-3 h-3 mr-1.5" />
                Go to course page
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
