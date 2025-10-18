"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";

export default function AllCoursesPage() {
  const { listData, loading, fetchAvailableCourses } = useAvailableCourses();

  useEffect(() => {
    fetchAvailableCourses({ page: 1, pageSize: 12, sortBy: "CreatedAt", sortDirection: "desc" });
  }, [fetchAvailableCourses]);

  return (
    <div className="flex flex-col gap-6">
      {/* ✅ Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-green-700">
          <BookOpen className="w-6 h-6 text-green-600" />
          All Courses
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse and discover all available courses you can join.
        </p>
      </div>

      {/* ✅ Loading state */}
      {loading && (
        <div className="flex justify-center py-10 text-green-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Loading courses...</span>
        </div>
      )}

      {/* ✅ Empty state */}
      {!loading && listData.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p>No available courses found.</p>
        </div>
      )}

      {/* ✅ Course grid */}
      {!loading && listData.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listData.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white h-full flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2">
                    {course.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>{course.enrollmentCount} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-green-600" />
                    <span>
                      Lecturer: <b>{course.lecturerName}</b>
                    </span>
                  </div>

                  <div className="mt-3">
                    {course.canJoin ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          if (course.joinUrl) window.location.href = course.joinUrl;
                        }}
                      >
                        Join Course
                      </Button>
                    ) : course.enrollmentStatus?.isEnrolled ? (
                      <Button disabled className="w-full bg-gray-200 text-gray-600">
                        Already Enrolled
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-gray-200 text-gray-600">
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
    </div>
  );
}
