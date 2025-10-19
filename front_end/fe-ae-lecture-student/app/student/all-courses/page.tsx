// app/student/all-courses/page.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, Loader2, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import FilterBar from "./components/FilterBar";
import AccessCodeJoinSheet from "./components/AccessCodeJoinSheet";

type AvailableCourse = {
  id: string;
  courseCode: string;
  name: string;
  description?: string | null;
  lecturerName: string;
  createdAt?: string;
  enrollmentCount: number;
  requiresAccessCode: boolean;
  isAccessCodeExpired?: boolean;
  enrollmentStatus?: { isEnrolled: boolean; joinedAt: string | null; status?: string | null } | null;
  canJoin: boolean;
};

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AllCoursesPage() {
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
    const query = { page: 1, pageSize: 12, sortBy: "CreatedAt" as const, sortDirection: "desc" as const };
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

  const courses = useMemo(() => listData as AvailableCourse[], [listData]);

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
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {/* ⭐ Flex column + h-full đảm bảo cao bằng nhau */}
              <Card className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-0">
                  {/* Row badges/date: giữ CHIỀU CAO CỐ ĐỊNH */}
                  <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[28px]">
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

                    {course.enrollmentStatus?.status ? (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {course.enrollmentStatus.status}
                      </span>
                    ) : (
                      // 👇 Giữ chỗ khi không có status để chiều cao hàng này không đổi
                      <span className="invisible inline-flex rounded-full border px-2.5 py-1 text-xs">placeholder</span>
                    )}

                    {course.createdAt ? (
                      <span className="text-xs text-slate-400">Created {formatDate(course.createdAt)}</span>
                    ) : (
                      // 👇 Giữ chỗ cho Created
                      <span className="invisible text-xs">placeholder</span>
                    )}
                  </div>

                  {/* Title: courseCode — description (không đổi chiều cao nhiều) */}
                  <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                    {course.courseCode}
                    {course.description ? ` — ${course.description}` : ""}
                  </CardTitle>

                  {/* Subtitle: Lecturer name (luôn có) */}
                  <p className="mt-1 text-sm font-medium text-slate-600">{course.lecturerName}</p>
                </CardHeader>

                {/* ⭐ Content = flex-grow; CTA đẩy xuống đáy bằng mt-auto */}
                <CardContent className="mt-3 flex grow flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-slate-700">{course.enrollmentCount} enrolled</span>
                  </div>

                  {/* push CTA to bottom */}
                  <div className="mt-auto">
                    {course.canJoin ? (
                      <Button
                        onClick={() => handleJoinClick(course)}
                        className="w-full rounded-xl bg-gradient-to-b from-green-500 to-green-600 text-white transition-all hover:from-green-600 hover:to-green-700"
                        disabled={loadingCourseId === course.id}
                      >
                        {loadingCourseId === course.id
                          ? "Joining..."
                          : course.requiresAccessCode
                          ? "Join with Code"
                          : "Join Course"}
                      </Button>
                    ) : course.enrollmentStatus?.isEnrolled ? (
                      <Button
                        onClick={() => (window.location.href = `/student/courses/${course.id}`)}
                        className="w-full rounded-xl bg-blue-500 text-white transition-all hover:bg-blue-600"
                      >
                        View Course
                      </Button>
                    ) : (
                      <Button disabled className="w-full rounded-xl bg-gray-100 font-medium text-gray-500">
                        Not Available
                      </Button>
                    )}
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
