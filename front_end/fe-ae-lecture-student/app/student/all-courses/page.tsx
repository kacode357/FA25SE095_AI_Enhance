"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import FilterBar from "./components/FilterBar";
import AccessCodeJoinSheet from "./components/AccessCodeJoinSheet";

export default function AllCoursesPage() {
  const { listData, loading, fetchAvailableCourses } = useAvailableCourses();
  const { joinCourse } = useJoinCourse();

  // Lưu query cuối cùng để refetch
  const lastQueryRef = useRef({
    page: 1,
    pageSize: 12,
    sortBy: "CreatedAt" as const,
    sortDirection: "desc" as const,
  });

  // Loading riêng cho từng course
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  // AccessCode Sheet
  const [accessOpen, setAccessOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);

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
      sortDirection:
        !filters.sortBy || filters.sortBy === "CreatedAt" ? "desc" : "asc",
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

  // ✅ Join course (không toast, không try/catch)
  const handleJoinClick = async (course: any) => {
    if (course.requiresAccessCode) {
      setSelectedCourse({
        id: course.id,
        title: `${course.courseCode} – ${course.lecturerName}`,
      });
      setAccessOpen(true);
      return;
    }

    setLoadingCourseId(course.id);
    await joinCourse(course.id);
    refetchAfterAction();
    setLoadingCourseId(null);
  };

  return (
    <div className="flex flex-col gap-6 py-4 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-green-700">
          <BookOpen className="w-7 h-7 text-green-600" />
          All Courses
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse and discover all available courses you can join.
        </p>
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
      {!loading && listData.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p>No available courses found.</p>
        </div>
      )}

      {/* Course Grid */}
      {!loading && listData.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listData.map((course: any, i: number) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="rounded-2xl border border-slate-200 shadow-md hover:shadow-lg bg-white transition-all duration-200">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                    {course.courseCode} – {course.lecturerName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="mt-3 flex flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-slate-700">
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-green-600" />
                    <span>
                      Lecturer:{" "}
                      <b className="text-slate-800">{course.lecturerName}</b>
                    </span>
                  </div>

                  <div className="mt-4">
                    {course.canJoin ? (
                      <Button
                        onClick={() => handleJoinClick(course)}
                        className="w-full bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-xl transition-all"
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
                        onClick={() =>
                          (window.location.href = `/student/courses/${course.id}`)
                        }
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition-all"
                      >
                        View Course
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gray-100 text-gray-500 rounded-xl font-medium"
                      >
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
