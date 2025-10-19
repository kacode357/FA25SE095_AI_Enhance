// app/student/all-courses/page.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Users, KeyRound, Loader2, CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import FilterBar from "./components/FilterBar";
import AccessCodeJoinSheet from "./components/AccessCodeJoinSheet";

/* ================== Types ================== */
type AvailableCourse = {
  id: string;
  courseCode: string;
  name: string;
  description?: string | null;
  lecturerId: string;
  lecturerName: string;
  createdAt?: string;
  enrollmentCount: number;
  requiresAccessCode: boolean;
  isAccessCodeExpired?: boolean;
  enrollmentStatus?: {
    isEnrolled: boolean;
    joinedAt: string | null;
    status?: string | null;
  } | null;
  canJoin: boolean;
  joinUrl?: string;
};

/* ================== Utils ================== */
function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusStyle(s?: string | null) {
  switch ((s || "").toLowerCase()) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
    case "pendingapproval":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    case "inactive":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function norm(s?: string | null) {
  return (s || "").replace(/\s+/g, "").toLowerCase();
}

function getCTA(course: AvailableCourse) {
  const status = norm(course.enrollmentStatus?.status);
  const isEnrolled = !!course.enrollmentStatus?.isEnrolled;

  if (isEnrolled) {
    return { label: "View Course", intent: "view" as const, disabled: false };
  }
  if (status === "pending" || status === "pendingapproval") {
    return { label: "Pending Approval", intent: "pending" as const, disabled: true };
  }
  if (status === "rejected" || status === "inactive") {
    return { label: "Not Available", intent: "disabled" as const, disabled: true };
  }
  if (course.canJoin) {
    if (course.requiresAccessCode) {
      return { label: "Join with Code", intent: "join-code" as const, disabled: !!course.isAccessCodeExpired };
    }
    return { label: "Join", intent: "join" as const, disabled: false };
  }
  return { label: "Not Available", intent: "disabled" as const, disabled: true };
}

/* ================== Page ================== */
export default function AllCoursesPage() {
  const router = useRouter();
  const { listData, loading, fetchAvailableCourses } = useAvailableCourses();
  const { joinCourse } = useJoinCourse();

  const lastQueryRef = useRef({
    page: 1,
    pageSize: 12,
    sortBy: "CreatedAt" as const,
    sortDirection: "desc" as const,
  });

  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchAvailableCourses(lastQueryRef.current);
  }, [fetchAvailableCourses]);

  const refetchAfterAction = () => fetchAvailableCourses(lastQueryRef.current);

  const handleFilter = (filters: {
    name?: string;
    lecturerName?: string;
    sortBy?: "CreatedAt" | "Name" | "EnrollmentCount";
  }) => {
    const query = {
      ...filters,
      page: 1,
      pageSize: 12,
      sortDirection: !filters.sortBy || filters.sortBy === "CreatedAt" ? "desc" : "asc",
    } as const;
    lastQueryRef.current = query as any;
    fetchAvailableCourses(query);
  };

  const handleReset = () => {
    const query = {
      page: 1,
      pageSize: 12,
      sortBy: "CreatedAt" as const,
      sortDirection: "desc" as const,
    };
    lastQueryRef.current = query;
    fetchAvailableCourses(query);
  };

  const handleJoinClick = async (course: AvailableCourse) => {
    if (course.requiresAccessCode) {
      setSelectedCourse({
        id: course.id,
        title: `${course.courseCode}${course.description ? ` — ${course.description}` : ""}`,
      });
      setAccessOpen(true);
      return;
    }
    setLoadingCourseId(course.id);
    await joinCourse(course.id);
    refetchAfterAction();
    setLoadingCourseId(null);
  };

  const courses = useMemo(() => (listData as AvailableCourse[]) ?? [], [listData]);

  return (
    <div className="flex flex-col gap-6 py-4 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-green-700">
          <BookOpen className="w-7 h-7 text-green-600" />
          All Courses
        </h1>
        <p className="text-slate-500 text-sm mt-1">Browse and discover all available courses you can join.</p>
      </div>

      {/* Filter */}
      <FilterBar onFilter={handleFilter} onReset={handleReset} />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12 text-green-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Loading courses...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p>No available courses found.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && courses.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-0">
                  {/* Top row: access badge, status badge, created date */}
                  <div className="mb-2 flex min-h-[28px] flex-wrap items-center gap-2">
                    {/* Access code / Open enrollment */}
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border " +
                        (course.requiresAccessCode
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700")
                      }
                    >
                      {course.requiresAccessCode ? (
                        <>
                          <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                          Access code required
                        </>
                      ) : (
                        <>Open enrollment</>
                      )}
                    </span>

                    {/* Status */}
                    {course.enrollmentStatus?.status ? (
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium " +
                          statusStyle(course.enrollmentStatus.status)
                        }
                      >
                        {course.enrollmentStatus.status}
                      </span>
                    ) : (
                      <span className="invisible inline-flex rounded-full border px-2.5 py-1 text-xs">placeholder</span>
                    )}

                    {/* Created date */}
                    {course.createdAt ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(course.createdAt)}
                      </span>
                    ) : (
                      <span className="invisible text-xs">placeholder</span>
                    )}
                  </div>

                  {/* Title */}
                  <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                    {course.courseCode}
                    {course.description ? ` — ${course.description}` : ""}
                  </CardTitle>

                  {/* Lecturer */}
                  <p className="mt-1 text-sm font-medium text-slate-600">{course.lecturerName}</p>
                </CardHeader>

                {/* Content */}
                <CardContent className="mt-3 flex grow flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-slate-700">{course.enrollmentCount} enrolled</span>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    {(() => {
                      const cta = getCTA(course);
                      const isBusy = loadingCourseId === course.id;
                      const baseBtn = "w-full h-9 text-sm rounded-lg transition-all";

                      if (cta.intent === "view") {
                        return (
                          <Button
                            onClick={() => router.push(`/student/courses/${course.id}`)}
                            className={`${baseBtn} bg-blue-500 text-white hover:bg-blue-600`}
                          >
                            View Course
                          </Button>
                        );
                      }

                      if (cta.intent === "join") {
                        return (
                          <Button
                            onClick={() => handleJoinClick(course)}
                            disabled={isBusy}
                            className={`${baseBtn} bg-gradient-to-b from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`}
                          >
                            {isBusy ? (
                              <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Joining...
                              </>
                            ) : (
                              "Join"
                            )}
                          </Button>
                        );
                      }

                      if (cta.intent === "join-code") {
                        return (
                          <Button
                            onClick={() => handleJoinClick(course)}
                            disabled={isBusy || !!course.isAccessCodeExpired}
                            className={`${baseBtn} bg-emerald-600 text-white hover:bg-emerald-700`}
                          >
                            {isBusy ? (
                              <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Joining...
                              </>
                            ) : (
                              <>
                                <KeyRound className="mr-1.5 h-4 w-4" /> Join with Code
                              </>
                            )}
                          </Button>
                        );
                      }

                      if (cta.intent === "pending") {
                        return <Button disabled className={`${baseBtn} bg-amber-100 text-amber-700`}>Pending Approval</Button>;
                      }

                      return <Button disabled className={`${baseBtn} bg-gray-100 text-gray-500`}>Not Available</Button>;
                    })()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>
      )}

      {/* Access Code Sheet */}
      <AccessCodeJoinSheet
        open={accessOpen}
        onOpenChange={setAccessOpen}
        courseId={selectedCourse?.id ?? null}
        courseTitle={selectedCourse?.title}
        onJoined={refetchAfterAction}
      />
    </div>
  );
}
