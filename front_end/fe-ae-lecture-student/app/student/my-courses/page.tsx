// app/student/my-courses/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Loader2,
  LogOut,
  MoreVertical,
  PlayCircle,
  CalendarDays,
  FileText,
} from "lucide-react";
import { useMyCourses } from "@/hooks/course/useMyCourses";
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
import { CourseItem } from "@/types/courses/course.response";
import { GetMyCoursesQuery } from "@/types/courses/course.payload";
import MyCoursesFilterBar from "./components/FilterBar";

/* ===== Utils ===== */
const DEFAULT_IMAGE_URL =
  "https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png";

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

/* ===== Page ===== */
export default function MyCoursesPage() {
  // ✅ đúng hook mới: returns CourseItem[]
  const { listData, loading, fetchMyCourses } = useMyCourses();
  const { leaveCourse } = useLeaveCourse();

  // confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCourse, setConfirmCourse] = useState<CourseItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // cache query
  const lastQueryRef = useRef<GetMyCoursesQuery>({
    asLecturer: false,
    page: 1,
    pageSize: 10,
    sortBy: "CreatedAt",
    sortDirection: "desc",
  });

  useEffect(() => {
    fetchMyCourses(lastQueryRef.current);
  }, [fetchMyCourses]);

  const courses = useMemo(() => (listData as CourseItem[]) ?? [], [listData]);

  const openConfirm = (course: CourseItem) => {
    setConfirmCourse(course);
    setConfirmOpen(true);
  };

  const doLeave = async () => {
    if (!confirmCourse) return;
    setConfirmLoading(true);
    const res = await leaveCourse(confirmCourse.id);
    setConfirmLoading(false);
    if (res) {
      toast.success(res.message || "Left course successfully");
      setConfirmOpen(false);
      setConfirmCourse(null);
      fetchMyCourses(lastQueryRef.current);
    }
  };

  /* ===== Filter handlers ===== */
  const handleFilter = (filters: Pick<GetMyCoursesQuery, "name" | "courseCode" | "lecturerName" | "sortBy">) => {
    const query: GetMyCoursesQuery = {
      ...lastQueryRef.current,
      ...filters,
      asLecturer: false,
      page: 1,
      sortDirection: !filters.sortBy || filters.sortBy === "CreatedAt" ? "desc" : "asc",
    };
    lastQueryRef.current = query;
    fetchMyCourses(query);
  };

  const handleReset = () => {
    const query: GetMyCoursesQuery = {
      asLecturer: false,
      page: 1,
      pageSize: 10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
    };
    lastQueryRef.current = query;
    fetchMyCourses(query);
  };

  return (
    <div className="py-6">
      <div className="mx-auto space-y-5" style={{ maxWidth: 1280, paddingLeft: "3.5rem", paddingRight: "3.5rem" }}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-nav">
            <BookOpen className="w-7 h-7 text-brand" />
            My Courses
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Courses you have joined and are currently enrolled in.
          </p>
        </div>

        {/* Filter */}
        <MyCoursesFilterBar onFilter={handleFilter} onReset={handleReset} />

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12 text-brand">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm">Loading your courses...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <BookOpen className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--muted)" }} />
            <p>You haven’t joined any courses yet.</p>
          </div>
        )}

        {/* Compact cards – LEFT image full height (no white space) */}
        {!loading && courses.length > 0 && (
          <section className="grid grid-cols-1 gap-5">
            {courses.map((course, i) => {
              const imgUrl =
                (course as any).img ||
                (course as any).imageUrl ||
                (course as any).thumbnailUrl ||
                (course as any).coverImageUrl ||
                (course as any).bannerUrl ||
                (course as any).image ||
                DEFAULT_IMAGE_URL;

              return (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  // flex + items-stretch để ảnh cao = chiều cao card
                  className="card overflow-hidden p-0 flex flex-col md:flex-row md:items-stretch"
                >
                  {/* LEFT: image full-height */}
                  <div className="w-full md:w-[280px] md:flex-shrink-0 md:self-stretch overflow-hidden">
                    {/* mobile giữ tỉ lệ 16:9 */}
                    <div className="block md:hidden aspect-[16/9] w-full">
                      <img
                        src={imgUrl}
                        alt={`${course.courseCode} banner`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          if (t.src !== DEFAULT_IMAGE_URL) t.src = DEFAULT_IMAGE_URL;
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    {/* desktop: ảnh cao = full card */}
                    <img
                      src={imgUrl}
                      alt={`${course.courseCode} banner`}
                      className="hidden md:block h-full w-full object-cover"
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        if (t.src !== DEFAULT_IMAGE_URL) t.src = DEFAULT_IMAGE_URL;
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* RIGHT: content */}
                  <div className="flex-1 p-4">
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {course.department && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ background: "rgba(255,255,255,0.9)", color: "var(--nav)", border: "1px solid var(--border)" }}
                          >
                            <BookOpen className="mr-1 h-3 w-3 text-brand" /> {course.department}
                          </span>
                        )}

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                            {course.courseCode}
                          </h3>
                          {(course.term || course.year) && (
                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                              • {course.term ?? "Term"}{course.year ? ` ${course.year}` : ""}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm font-medium text-brand">
                          {course.lecturerName}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => (window.location.href = `/student/courses/${course.id}`)}
                          className="btn btn-gradient-slow"
                          style={{ height: 36, borderRadius: 10, paddingInline: 12 }}
                          title="Go to Course"
                        >
                          <PlayCircle className="w-5 h-5" />
                          <span className="hidden sm:inline">Go to Course</span>
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label="More actions"
                              className="grid place-items-center rounded-full"
                              style={{ height: 36, width: 36, color: "var(--foreground)", background: "transparent", border: "1px solid transparent" }}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            side="bottom"
                            sideOffset={6}
                            className="w-44 z-[60] rounded-2xl"
                            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                          >
                            <DropdownMenuItem
                              onClick={() => openConfirm(course)}
                              className="cursor-pointer rounded-md"
                              style={{ color: "var(--accent)" }}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Leave course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Description (truncate 2 dòng) */}
                    {course.description && (
                      <div className="mt-2 flex items-start gap-2">
                        <FileText className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        <p
                          className="text-sm"
                          style={{
                            color: "var(--foreground)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={course.description || undefined}
                        >
                          {course.description}
                        </p>
                      </div>
                    )}

                    {/* Meta line */}
                    <div className="mt-2 text-sm flex flex-wrap items-center gap-x-4 gap-y-2" style={{ color: "var(--foreground)" }}>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-brand" />
                        {course.enrollmentCount} enrolled
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-brand" />
                        Created {formatDate(course.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}

        {/* Confirm Leave Dialog */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent
            className="rounded-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: "var(--foreground)" }}>
                Leave this course?
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: "var(--text-muted)" }}>
                {confirmCourse
                  ? `You're about to leave "${confirmCourse.courseCode}". You can rejoin later if allowed.`
                  : `You're about to leave this course.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                disabled={confirmLoading}
                className="btn"
                style={{ background: "var(--card)", color: "var(--brand)", border: "1px solid var(--brand)", height: 38, borderRadius: 10 }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={confirmLoading}
                onClick={doLeave}
                className="btn btn-gradient-slow"
                style={{ height: 38, borderRadius: 10 }}
              >
                {confirmLoading ? "Leaving..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
