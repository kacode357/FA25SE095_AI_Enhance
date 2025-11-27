// app/student/all-courses/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen } from "lucide-react";

import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import { useTermsQuery } from "@/hooks/term/useTermsQuery";
import { useCoursesByTermYear } from "@/hooks/course/useCoursesByTermYear";

import SidebarFilters from "./components/SidebarFilters";
import ResultsHeader from "./components/ResultsHeader";
import CourseList from "./components/CourseList";

import type {
  AvailableCourseItem,
  CoursesByTermYearItem,
} from "@/types/courses/course.response";

// 🔹 NEW: global tour component (ở app/student/components)
import AllCoursesTour from "../components/AllCoursesTour";

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

const mapSortByToBackend = (
  sortBy: SortBy
): "Name" | "CourseCode" | "EnrollmentCount" | "CreatedAt" => {
  switch (sortBy) {
    case "Name":
      return "Name";
    case "EnrollmentCount":
      return "EnrollmentCount";
    case "CreatedAt":
    default:
      return "CreatedAt";
  }
};

const mapTermCourseToAvailable = (
  c: CoursesByTermYearItem
): AvailableCourseItem => ({
  id: c.id,
  courseCode: c.courseCode,
  name: c.name,
  description: c.description,
  lecturerId: c.lecturerId,
  lecturerName: c.lecturerName,
  createdAt: c.createdAt,
  enrollmentCount: c.enrollmentCount,
  requiresAccessCode: c.requiresAccessCode,
  isAccessCodeExpired: c.isAccessCodeExpired,
  img: c.img ?? null,
  uniqueCode: c.uniqueCode,
  lecturerImage: c.lecturerImage ?? null,
  termStartDate: c.termStartDate,
  termEndDate: c.termEndDate,
  enrollmentStatus: null,
  canJoin: c.canEnroll,
  joinUrl: null,
  announcement: null,
});

export default function AllCoursesPage() {
  const router = useRouter();

  // ===== API /Courses/available (default) =====
  const {
    listData,
    totalCount,
    currentPage,
    pageSize,
    loading,
    fetchAvailableCourses,
  } = useAvailableCourses();

  const { joinCourse } = useJoinCourse();

  // ===== Terms list =====
  const {
    data: termList,
    loading: termsLoading,
    fetchTerms,
  } = useTermsQuery({
    page: 1,
    pageSize: 50,
    sortBy: "Name",
    sortDirection: "asc",
    activeOnly: true,
  });

  // ===== API /Courses/by-term-year (search theo kỳ) =====
  const {
    data: termCourses,
    loading: termCoursesLoading,
    meta: termMeta,
    fetchCourses: fetchCoursesByTermYear,
  } = useCoursesByTermYear({
    termId: "00000000-0000-0000-0000-000000000000",
    page: 1,
    pageSize: 10,
    sortBy: "Name",
    sortDirection: "asc",
  });

  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("CreatedAt");

  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const lastQueryRef = useRef<CoursesQueryState>({
    page: 1,
    pageSize: 10,
    sortBy: "CreatedAt",
    sortDirection: "desc",
    courseCode: undefined,
    lecturerName: undefined,
    termId: undefined,
  });

  useEffect(() => {
    fetchAvailableCourses(lastQueryRef.current as any);
    fetchTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usingTermFilter = !!selectedTermId;

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

    const effectiveTermId = next.termId;

    if (effectiveTermId) {
      const backendSortBy = mapSortByToBackend(next.sortBy);
      fetchCoursesByTermYear({
        termId: effectiveTermId,
        courseCode: next.courseCode,
        page: next.page,
        pageSize: next.pageSize,
        sortBy: backendSortBy,
        sortDirection: next.sortDirection,
      });
    } else {
      fetchAvailableCourses(next as any);
    }
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

  const refetchAfterAction = () => {
    const current = lastQueryRef.current;
    if (current.termId) {
      const backendSortBy = mapSortByToBackend(current.sortBy);
      fetchCoursesByTermYear({
        termId: current.termId,
        courseCode: current.courseCode,
        page: current.page,
        pageSize: current.pageSize,
        sortBy: backendSortBy,
        sortDirection: current.sortDirection,
      });
    } else {
      fetchAvailableCourses(current as any);
    }
  };

  const handleJoinClick = async (course: AvailableCourseItem) => {
    // 🔹 Course cần access code → chuyển sang trang join riêng
    if (course.requiresAccessCode) {
      const title = `${course.courseCode}${
        course.description ? ` — ${course.description}` : ""
      }`;

      const params = new URLSearchParams();
      params.set("title", title);
      if (course.lecturerName) params.set("lecturer", course.lecturerName);
      if (course.uniqueCode) params.set("classCode", course.uniqueCode);

      router.push(`/student/all-courses/${course.id}/join?${params.toString()}`);
      return;
    }

    // 🔹 Course không cần access code → join trực tiếp như cũ
    setLoadingCourseId(course.id);
    await joinCourse(course.id);
    refetchAfterAction();
    setLoadingCourseId(null);
  };

  const handleGoToCourse = (id: string) => {
    router.push(`/student/courses/${id}`);
  };

  const availableCourses: AvailableCourseItem[] = Array.isArray(listData)
    ? listData
    : [];

  let termCoursesMapped: AvailableCourseItem[] = [];
  if (usingTermFilter) {
    const lecturerFilter = lecturerName.trim().toLowerCase();
    const filteredByLecturer = termCourses.filter((c) =>
      lecturerFilter
        ? c.lecturerName.toLowerCase().includes(lecturerFilter)
        : true
    );
    termCoursesMapped = filteredByLecturer.map(mapTermCourseToAvailable);
  }

  const displayCourses = usingTermFilter ? termCoursesMapped : availableCourses;

  const totalItems: number = usingTermFilter
    ? termMeta.totalCount
    : typeof totalCount === "number"
    ? totalCount
    : availableCourses.length;

  const displayPage = usingTermFilter ? termMeta.page : currentPage;
  const displayPageSize = usingTermFilter ? termMeta.pageSize : pageSize;
  const isLoading = usingTermFilter ? termCoursesLoading : loading;

  return (
    <div className="py-6" data-tour="allcourses-layout">
      <div
        className="mx-auto"
        style={{
          maxWidth: 1280,
          paddingLeft: "3.5rem",
          paddingRight: "3.5rem",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* LEFT 4: sidebar */}
          <aside
            className="lg:col-span-4"
            data-tour="allcourses-sidebar-filters"
          >
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
            <div data-tour="allcourses-results-header">
              <ResultsHeader
                total={totalItems}
                page={displayPage}
                pageSize={displayPageSize}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>

            <div data-tour="allcourses-course-list">
              {isLoading && (
                <div
                  className="flex justify-center py-10"
                  style={{ color: "var(--brand)" }}
                >
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2 text-sm">Loading courses...</span>
                </div>
              )}

              {!isLoading && displayCourses.length === 0 && (
                <div className="text-center py-14">
                  <BookOpen
                    className="w-10 h-10 mx-auto mb-2"
                    style={{ color: "var(--muted)" }}
                  />
                  <p style={{ color: "var(--text-muted)" }}>
                    No available courses found.
                  </p>
                </div>
              )}

              {!isLoading && displayCourses.length > 0 && (
                <CourseList
                  courses={displayCourses}
                  loadingCourseId={loadingCourseId}
                  onGoToCourse={handleGoToCourse}
                  onJoinClick={handleJoinClick}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 🔹 Tour overlay cho trang /student/all-courses */}
      <AllCoursesTour />
    </div>
  );
}
