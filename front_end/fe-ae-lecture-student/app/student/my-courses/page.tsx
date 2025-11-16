// app/student/my-courses/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Loader2, LogOut, MoreVertical, PlayCircle, CalendarDays, FileText } from "lucide-react";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useLeaveCourse } from "@/hooks/enrollments/useLeaveCourse";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { CourseItem } from "@/types/courses/course.response";
import { GetMyCoursesQuery } from "@/types/courses/course.payload";
import MyCoursesFilterBar from "./components/FilterBar";

/* ===== Utils & Constants ===== */
const DEFAULT_IMG = "https://i.postimg.cc/VL3PwwpK/Gemini-Generated-Image-pu4lm6pu4lm6pu4l.png";

const formatDate = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

/* ===== Sub-component: Course Card ===== */
const CourseCard = ({
  course,
  index,
  onOpenConfirm
}: {
  course: CourseItem;
  index: number;
  onOpenConfirm: (c: CourseItem) => void;
}) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card overflow-hidden p-0 flex flex-col sm:flex-row group hover:border-[var(--brand-600)] transition-colors"
    >
      {/* Ảnh thu nhỏ (Compact) */}
      <div className="w-full sm:w-48 shrink-0 relative overflow-hidden">
        <div className="aspect-video sm:h-full sm:aspect-auto">
          <img
            src={course.img || DEFAULT_IMG}
            alt={course.courseCode}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = DEFAULT_IMG)}
            loading="lazy"
          />
        </div>
      </div>

      {/* Nội dung */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              {course.department && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--border)] bg-slate-50 text-[var(--nav)]">
                  {course.department}
                </span>
              )}
              <h3 className="text-lg font-bold text-[var(--foreground)] mt-1 truncate" title={course.courseCode}>
                {course.courseCode}
              </h3>
              <p className="text-sm font-medium text-[var(--brand)] truncate">{course.lecturerName}</p>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-[var(--foreground)] transition-colors outline-none">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-[var(--border)] bg-[var(--card)]">
                <DropdownMenuItem onClick={() => onOpenConfirm(course)} className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Leave
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {course.description && (
            <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2" title={course.description}>
              {course.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {course.enrollmentCount}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" /> {formatDate(course.createdAt)}
            </span>
          </div>
          
          <a href={`/student/courses/${course.id}`} className="btn btn-gradient-slow h-9 px-4 text-sm rounded-lg shadow-sm hover:shadow-md">
            <PlayCircle className="w-4 h-4" /> Continue
          </a>
        </div>
      </div>
    </motion.article>
  );
};

/* ===== Main Page ===== */
export default function MyCoursesPage() {
  const { listData, loading, fetchMyCourses } = useMyCourses();
  const { leaveCourse } = useLeaveCourse();

  const [confirmState, setConfirmState] = useState<{ open: boolean; course: CourseItem | null; loading: boolean }>({
    open: false, course: null, loading: false
  });

  const lastQuery = useRef<GetMyCoursesQuery>({
    asLecturer: false, page: 1, pageSize: 10, sortBy: "CreatedAt", sortDirection: "desc",
  });

  useEffect(() => { fetchMyCourses(lastQuery.current); }, [fetchMyCourses]);

  const courses = useMemo(() => (listData as CourseItem[]) ?? [], [listData]);

  const handleFilter = (filters: any) => {
    const query = { ...lastQuery.current, ...filters, page: 1 };
    lastQuery.current = query;
    fetchMyCourses(query);
  };

  const handleLeaveCourse = async () => {
    if (!confirmState.course) return;
    setConfirmState(prev => ({ ...prev, loading: true }));
    
    const res = await leaveCourse(confirmState.course.id);
    
    setConfirmState(prev => ({ ...prev, loading: false }));
    if (res) {
      toast.success(res.message || "Left course successfully");
      setConfirmState({ open: false, course: null, loading: false });
      fetchMyCourses(lastQuery.current);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--nav)] flex items-center gap-3">
          <div className="p-2 bg-[var(--brand)] bg-opacity-10 rounded-xl">
            <BookOpen className="w-6 h-6 text-[var(--brand)]" />
          </div>
          My Courses
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">Manage and access your enrolled learning materials.</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <MyCoursesFilterBar onFilter={handleFilter} onReset={() => handleFilter({ name: undefined, courseCode: undefined, lecturerName: undefined })} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--brand)]">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-medium text-[var(--foreground)]">No courses found</h3>
          <p className="text-[var(--text-muted)]">You haven't joined any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course, i) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              index={i} 
              onOpenConfirm={(c) => setConfirmState({ open: true, course: c, loading: false })} 
            />
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <AlertDialog open={confirmState.open} onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Course?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave <span className="font-bold text-[var(--foreground)]">"{confirmState.course?.courseCode}"</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmState.loading} className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={confirmState.loading} 
              onClick={handleLeaveCourse} 
              className="btn-gradient-slow rounded-lg border-0"
            >
              {confirmState.loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}