// app/student/all-courses/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen } from "lucide-react";

import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import { useTerms } from "@/hooks/term/useTerms";

import AccessCodeJoinSheet from "./components/AccessCodeJoinSheet";
import SidebarFilters from "./components/SidebarFilters";
import ResultsHeader from "./components/ResultsHeader";
import CourseList from "./components/CourseList";

import type { AvailableCourseItem } from "@/types/courses/course.response";

type SortBy = "CreatedAt" | "Name" | "EnrollmentCount";
type SortDirection = "desc" | "asc";

type CoursesQueryState = {
  page: number;
  pageSize: number;
  sortBy: SortBy;
  sortDirection: SortDirection;
  courseCode: string | undefined;
  lecturerName: string | undefined;
  termId: string | undefined;
};

export default function AllCoursesPage() {
  const router = useRouter();

  const {
    listData,
    totalCount,
    currentPage,
    pageSize,
    loading,
    fetchAvailableCourses,
  } = useAvailableCourses();

  const { joinCourse } = useJoinCourse();

  // ✅ useTerms không còn error nữa
  const {
    data: termList,
    loading: termsLoading,
    fetchTerms,
  } = useTerms();

  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("CreatedAt");

  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(
    null
  );

  const lastQueryRef = useRef<CoursesQueryState>({
    page: 1,
    pageSize: 10,
    sortBy: "CreatedAt",
    sortDirection: "desc",
    courseCode: undefined,
    lecturerName: undefined,
    termId: undefined,
  });

  /** ===== Map response ===== */
  const courses: AvailableCourseItem[] = Array.isArray(listData) ? listData : [];

  const totalItems: number = typeof totalCount === "number" ? totalCount : courses.length;

  /** ===== Fetch initial ===== */
  useEffect(() => {
    fetchAvailableCourses(lastQueryRef.current as any);
  }, [fetchAvailableCourses]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  /** ===== Helpers ===== */
  const runQuery = (override?: Partial<CoursesQueryState>) => {
    const next: CoursesQueryState = {
      ...lastQueryRef.current,
      courseCode: courseCode.trim() || undefined,
      lecturerName: lecturerName.trim() || undefined,
      termId: selectedTermId || undefined,
      sortBy,
      sortDirection: sortBy === "CreatedAt" ? "desc" : "asc",
      page: 1,
      ...override,
    };

    lastQueryRef.current = next;
    fetchAvailableCourses(next as any);
  };

  const handleSearchSubmit = () => runQuery();

  const handleTermToggle = (termId: string) => {
    const nextSelected = selectedTermId === termId ? null : termId;
    setSelectedTermId(nextSelected);
    runQuery({ termId: nextSelected || undefined });
  };

  const handleSortChange = (value: SortBy) => {
    setSortBy(value);
    runQuery({ sortBy: value });
  };

  const handleResetFilters = () => {
    setCourseCode("");
    setLecturerName("");
    setSelectedTermId(null);
    setSortBy("CreatedAt");

    const base: CoursesQueryState = {
      page: 1,
      pageSize: lastQueryRef.current.pageSize,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      courseCode: undefined,
      lecturerName: undefined,
      termId: undefined,
    };
    lastQueryRef.current = base;
    fetchAvailableCourses(base as any);
  };

  const refetchAfterAction = () => fetchAvailableCourses(lastQueryRef.current as any);

  const handleJoinClick = async (course: AvailableCourseItem) => {
    if (course.requiresAccessCode) {
      setSelectedCourse({
        id: course.id,
        title: `${course.courseCode}${
          course.description ? ` — ${course.description}` : ""
        }`,
      });
      setAccessOpen(true);
      return;
    }
    setLoadingCourseId(course.id);
    await joinCourse(course.id);
    refetchAfterAction();
    setLoadingCourseId(null);
  };

  const handleGoToCourse = (id: string) => {
    router.push(`/student/courses/${id}`);
  };

  /** ===== Render ===== */
  return (
    <div className="py-6">
      <div
        className="mx-auto"
        style={{ maxWidth: 1280, paddingLeft: "3.5rem", paddingRight: "3.5rem" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* LEFT 4: sidebar */}
          <aside className="lg:col-span-4">
            <SidebarFilters
              courseCode={courseCode}
              lecturerName={lecturerName}
              selectedTermId={selectedTermId}
              onCourseCodeChange={setCourseCode}
              onLecturerChange={setLecturerName}
              onSearchSubmit={handleSearchSubmit}
              onReset={handleResetFilters}
              onTermToggle={handleTermToggle}
              terms={termList}
              termsLoading={termsLoading}
          
            />
          </aside>

          {/* RIGHT 6: kết quả */}
          <section className="lg:col-span-6 space-y-4">
            <ResultsHeader
              total={totalItems}
              page={currentPage}
              pageSize={pageSize}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            {loading && (
              <div className="flex justify-center py-10" style={{ color: "var(--brand)" }}>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-sm">Loading courses...</span>
              </div>
            )}

            {!loading && courses.length === 0 && (
              <div className="text-center py-14">
                <BookOpen
                  className="w-10 h-10 mx-auto mb-2"
                  style={{ color: "var(--muted)" }}
                />
                <p style={{ color: "var(--text-muted)" }}>No available courses found.</p>
              </div>
            )}

            {!loading && courses.length > 0 && (
              <CourseList
                courses={courses}
                loadingCourseId={loadingCourseId}
                onGoToCourse={handleGoToCourse}
                onJoinClick={handleJoinClick}
              />
            )}
          </section>
        </div>

        <AccessCodeJoinSheet
          open={accessOpen}
          onOpenChange={setAccessOpen}
          courseId={selectedCourse?.id ?? null}
          courseTitle={selectedCourse?.title}
          onJoined={refetchAfterAction}
        />
      </div>
    </div>
  );
}
