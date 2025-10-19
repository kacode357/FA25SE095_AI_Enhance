// app/student/my-courses/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, Loader2, LogOut, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyCourses } from "@/hooks/enrollments/useMyCourses";
import { useLeaveCourse } from "@/hooks/enrollments/useLeaveCourse";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type CourseCard = {
  courseId: string;
  courseCode: string;          // "CHEM200"
  courseName: string;          // "CHEM200 - Smith John"
  description?: string | null; // "New Chem"
  lecturerName: string;        // "Smith John"
  term?: string | null;        // "Fall"
  year?: number | null;        // 2025
  joinedAt?: string | null;    // ISO
  enrollmentId?: string;
  enrollmentCount: number;     // 3
  department?: string | null;  // "Chemistry"
};

function formatDate(iso?: string | null) {
  if (!iso) return "Unknown date";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); // e.g. Oct 19, 2025
}

export default function MyCoursesPage() {
  const { listData, loading, fetchMyCourses } = useMyCourses();
  const { leaveCourse } = useLeaveCourse();

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCourse, setConfirmCourse] = useState<CourseCard | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const openConfirm = (course: CourseCard) => {
    setConfirmCourse(course);
    setConfirmOpen(true);
  };

  const doLeave = async () => {
    if (!confirmCourse) return;
    setConfirmLoading(true);
    const res = await leaveCourse(confirmCourse.courseId); // res | null, no throw
    setConfirmLoading(false);
    if (res) {
      toast.success(res.message || "Left course successfully");
      setConfirmOpen(false);
      setConfirmCourse(null);
      fetchMyCourses();
    }
  };

  // ensure stable typed list
  const courses: CourseCard[] = useMemo(() => listData as CourseCard[], [listData]);

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
      {!loading && courses.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p>You haven’t joined any courses yet.</p>
        </div>
      )}

      {/* Course Grid */}
      {!loading && courses.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="relative rounded-2xl border border-slate-200 shadow-md hover:shadow-lg bg-white transition-all duration-200">
                {/* Kebab (3 dots) top-right */}
                <div className="absolute right-2 top-2 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="More actions"
                        className="h-8 w-8 grid place-items-center rounded-full bg-transparent hover:bg-slate-100/70 text-slate-700 focus:outline-none"
                        disabled={confirmLoading && confirmCourse?.courseId === course.courseId}
                      >
                        {confirmLoading && confirmCourse?.courseId === course.courseId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          // 3 dot fill → always visible
                          <span className="relative block h-4 w-[3px]">
                            <span className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full bg-slate-700" />
                            <span className="absolute left-0 top-1/2 -mt-[1.5px] h-[3px] w-[3px] rounded-full bg-slate-700" />
                            <span className="absolute left-0 bottom-0 h-[3px] w-[3px] rounded-full bg-slate-700" />
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="w-44 z-[60]">
                      <DropdownMenuItem
                        onClick={() => openConfirm(course)}
                        className="text-red-600 focus:text-red-700"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Leave course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader className="pb-0">
                  {/* Badges row: Department + Term/Year */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {course.department && (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <BookOpen className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                        {course.department}
                      </span>
                    )}
                    {(course.term || course.year) && (
                      <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                        {course.term ?? "Term"}{course.year ? ` ${course.year}` : ""}
                      </span>
                    )}
                  </div>

                  {/* Title: use courseName to avoid duplication */}
                  <CardTitle className="text-lg font-bold text-slate-900 leading-tight pr-10">
                    {course.courseName}
                  </CardTitle>

                  {/* Subtitle: description (muted) */}
                  {course.description && (
                    <p className="mt-1 text-sm text-slate-500">{course.description}</p>
                  )}
                </CardHeader>

                <CardContent className="mt-3 flex flex-col gap-2.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-slate-700">
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Joined {formatDate(course.joinedAt)}</span>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() => (window.location.href = `/student/courses/${course.courseId}`)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition-all"
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

      {/* Confirm Leave Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this course?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCourse
                ? `You're about to leave "${confirmCourse.courseName}". You can rejoin later if allowed.`
                : `You're about to leave this course.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
             className="bg-red-600 hover:bg-red-700 text-white"
              disabled={confirmLoading}
              onClick={doLeave}
            >
              {confirmLoading ? "Leaving..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
