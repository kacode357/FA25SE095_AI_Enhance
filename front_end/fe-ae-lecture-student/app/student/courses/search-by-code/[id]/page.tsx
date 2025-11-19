// app/student/courses/search-by-code/[id]/page.tsx
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

const DEFAULT_IMAGE_URL =
  "https://i.postimg.cc/VL3PwwpK/Gemini-Generated-Image-pu4lm6pu4lm6pu4l.png";

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

  const imageUrl =
    course?.img && typeof course.img === "string" && course.img.trim().length > 0
      ? course.img
      : DEFAULT_IMAGE_URL;

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-3">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2.5">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              <span className="text-sm text-slate-500">
                Loading course information...
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !course && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
            Course not found.
          </div>
        )}

        {/* Course detail */}
        {!loading && !error && course && (
          <Card className="rounded-2xl shadow-sm border border-brand/40 p-0 overflow-hidden">
            {/* IMAGE SÁT LÊN TRÊN CARD */}
            <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
              <img
                src={imageUrl}
                alt={course.courseCodeTitle || course.courseCode || "Course image"}
                className="block h-full w-full object-cover"
              />
            </div>

            {/* HEADER – GIẢM PADDING DỌC */}
            <CardHeader className="px-5 py-2 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>

                <div className="flex-1 space-y-1">
                  <h2 className="text-base font-semibold text-slate-900 leading-snug">
                    {course.courseCodeTitle || "Untitled course"}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-600">
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

            {/* CONTENT – SIẾT PADDING DỌC */}
            <CardContent className="px-5 pt-2 pb-2 space-y-2.5">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                {/* Lecturer */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border border-slate-300 bg-slate-50">
                    <AvatarImage
                      src={course.lecturerImage ?? undefined}
                      alt={course.lecturerName ?? "Lecturer"}
                    />
                    <AvatarFallback className="text-[11px] font-semibold text-brand">
                      {course.lecturerName
                        ? course.lecturerName.charAt(0).toUpperCase()
                        : "L"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-[11px] leading-tight">
                    <div className="text-slate-500 font-semibold uppercase tracking-wide">
                      Lecturer
                    </div>
                    <div className="flex items-center gap-1 text-slate-900 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-slate-500" />
                      <span className="font-medium text-xs">
                        {course.lecturerName ?? "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-0.5 text-[11px] text-slate-600">
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

                  {(course.term ||
                    dt(course.termStartDate) ||
                    dt(course.termEndDate)) && (
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
                        {(dt(course.termStartDate) ||
                          dt(course.termEndDate)) && (
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

              {/* Description – GẦN HƠN, ÍT PADDING */}
              {course.description && (
                <div className="pt-1.5 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                    Description
                  </p>
                  <p className="text-sm text-slate-700 leading-snug">
                    {course.description}
                  </p>
                </div>
              )}
            </CardContent>

            {/* FOOTER – ÍT PADDING HƠN */}
            <CardFooter className="px-5 pt-0 pb-2 flex items-center justify-end">
              <Button
                size="sm"
                onClick={handleGoToCourse}
                className="btn-blue-slow text-xs px-4 py-1.5 rounded-xl"
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
