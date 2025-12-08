"use client";

import {
  CourseStatus,
  getCourseStatusColor,
  getCourseStatusText,
  LecturerCourseStatusFilterOptions,
} from "@/config/course-status";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import type { GetMyCoursesQuery } from "@/types/courses/course.payload";
import { formatToVN, toVNLocalISOString } from "@/utils/datetime/time";
import { LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CourseCard from "./components/CourseCard";

export default function LecturerCoursesPage() {
  const {
    listData,
    totalCount,
    pageSize,
    loading,
    fetchMyCourses,
  } = useMyCourses();

  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  const [statusFilter, setStatusFilter] = useState<CourseStatus>(CourseStatus.Active);

  const buildParams = (overrides?: Partial<GetMyCoursesQuery>): GetMyCoursesQuery => ({
    asLecturer: true,
    name: name || undefined,
    courseCode: courseCode || undefined,
    page,
    pageSize,
    sortBy: "CreatedAt",
    sortDirection: "desc",
    ...overrides,
  });

  const [clientFilterMode, setClientFilterMode] = useState(false);
  const prevStatusRef = useRef<CourseStatus | null>(null);

  useEffect(() => {
    const prev = prevStatusRef.current;

    if (prev !== statusFilter) {
      setClientFilterMode(true);
      setPage(1);
      fetchMyCourses(buildParams({ page: 1, pageSize: 1000 }), true);
    } else {
      setClientFilterMode(false);
      fetchMyCourses(buildParams());
    }

    prevStatusRef.current = statusFilter;
  }, [page, name, courseCode, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const filteredList = clientFilterMode
      ? listData.filter((c) => Number(c.status) === Number(statusFilter))
    : listData;

  if (clientFilterMode) {
    // Debug: show fetched vs filtered counts and sample statuses
    // (temporary - remove or gate this in production)
    // eslint-disable-next-line no-console
    console.debug(
      'Course list fetch: total=',
      listData.length,
      'statusFilter=',
      statusFilter,
      'filtered=',
      filteredList.length,
      'sampleStatuses=',
      listData.slice(0, 10).map((c) => c.status)
    );
  }
  
  useEffect(() => {
    if (!listData || listData.length === 0) return;
    const sample = listData[0];
    // If backend returns a createdAt or updatedAt in UTC ISO string, demonstrate VN formatting
    // This is only a demo log — remove or replace with UI formatting as needed.
    // @ts-ignore
    const utc = sample.createdAt || sample.created_at || sample.updatedAt || sample.updated_at;
    if (utc) {
      try {
        // formatted human string in VN timezone
        // @ts-ignore
        console.debug('Sample time (UTC):', utc, '-> VN formatted:', formatToVN(utc, { dateStyle: 'medium', timeStyle: 'short' }));
        // @ts-ignore
        console.debug('Sample VN ISO-like:', toVNLocalISOString(utc));
      } catch (e) {
        // ignore
      }
    }
  }, [listData]);
  const displayedTotal = filteredList.length;

  const totalPages = clientFilterMode
    ? Math.max(1, Math.ceil(displayedTotal / pageSize))
    : Math.max(1, Math.ceil(totalCount / pageSize));

  const pagedList = clientFilterMode
    ? filteredList.slice((page - 1) * pageSize, page * pageSize)
    : listData;

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  const router = useRouter();

  const handleCourseUpdated = async () => {
    // refetch appropriately depending on clientFilterMode
    if (clientFilterMode) {
      await fetchMyCourses(buildParams({ page: 1, pageSize: 1000 }), true);
    } else {
      await fetchMyCourses(buildParams(), true);
    }
  };

  const handleEdit = (courseId: string) => {
    router.push(`/lecturer/course/${courseId}/course`);
  };

  const handleDelete = async (courseId: string) => {
    // after deletion elsewhere, refetch the list
    await handleCourseUpdated();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">My Courses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage all courses where you are the lecturer.
        </p>
      </header>

      {/* Search Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white px-5 py-2 pb-4 shadow-sm"
      >
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-medium text-slate-600">Course name</label>
          <input
            className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="min-w-[180px]">
          <label className="text-xs font-medium text-slate-600">Course code</label>
          <input
            className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="Search by code..."
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-10 px-5 rounded-lg bg-slate-900 btn btn-gradient-slow text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Status Filter + View Mode */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <div className="flex flex-wrap gap-2 bg-slate-100 p-0.5 rounded-full">
            {LecturerCourseStatusFilterOptions.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(option.value);
                    setPage(1);
                  }}
                  className={`rounded-full cursor-pointer px-4 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-violet-700 shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">View:</span>
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md cursor-pointer transition-colors ${viewMode === "card" ? "bg-white shadow-sm" : ""}`}
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md cursor-pointer transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-700">
          Courses <span className="font-medium text-slate-500">({clientFilterMode ? displayedTotal : totalCount})</span>
        </div>

        {loading && filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Loading courses...</div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No courses found.</div>
        ) : viewMode === "list" ? (
          /* List View */
          <ul className="divide-y divide-slate-100">
            {pagedList.map((course) => (
              <li key={course.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 truncate max-w-md">
                        {course.courseCode} — {course.courseCodeTitle}
                      </h3>
                      <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full">
                        {course.courseCode}
                      </span>
                      <span className={`text-xs font-medium ${getCourseStatusColor(course.status)}`}>
                        {getCourseStatusText(course.status)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      <span>Term {course.term}</span>
                      <span className="mx-2">•</span>
                      <span>{course.enrollmentCount} students</span>
                      {course.requiresAccessCode && course.accessCode && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-emerald-700 font-medium">Access code enabled</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="ml-auto">
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="h-9 px-4 rounded-lg btn btn-gradient-slow text-sm font-medium text-white"
                    >
                      <List className=" h-4 w-4" />Manage Course
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          /* Card View */
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pagedList.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => handleEdit(course.id)}
                onDelete={() => handleDelete(course.id)}
                onUpdated={handleCourseUpdated}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                disabled={page === 1 || loading}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={page === totalPages || loading}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}