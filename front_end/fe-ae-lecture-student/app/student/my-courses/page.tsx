"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyCourses } from "@/hooks/enrollments/useMyCourses";

export default function MyCoursesPage() {
  const { listData, loading, fetchMyCourses } = useMyCourses();

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  return (
    <div className="flex flex-col gap-6 py-4 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-green-700">
          <BookOpen className="w-7 h-7 text-green-600" />
          My Courses
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Courses you have joined and are currently enrolled in.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12 text-green-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Loading your courses...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && listData.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p>You haven’t joined any courses yet.</p>
        </div>
      )}

      {/* Course Grid */}
      {!loading && listData.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listData.map((course, i) => (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="rounded-2xl border border-slate-200 shadow-md hover:shadow-lg bg-white transition-all duration-200">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                    {course.courseCode} – {course.courseName}
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

                  {course.term && (
                    <div className="text-slate-500 text-xs">
                      Term: <b>{course.term}</b>{" "}
                      {course.year && `(${course.year})`}
                    </div>
                  )}

                  <div className="mt-4">
                    <Button
                      onClick={() =>
                        (window.location.href = `/student/courses/${course.courseId}`)
                      }
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition-all"
                    >
                      View Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  );
}
