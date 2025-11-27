// app/lecturer/course/page.tsx
"use client";

import { useEffect, useState } from "react";

import { useMyCourses } from "@/hooks/course/useMyCourses";
import type { GetMyCoursesQuery } from "@/types/courses/course.payload";

export default function LecturerCoursesPage() {
  const {
    listData,
    totalCount,
    currentPage,
    pageSize,
    loading,
    fetchMyCourses,
  } = useMyCourses();

  // 🔎 filter basic: name + courseCode
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");

  // dùng state riêng cho page để control
  const [page, setPage] = useState(1);

  // build params cho API
  const buildParams = (): GetMyCoursesQuery => ({
    asLecturer: true, // ✅ BẮT BUỘC: lecturer mode
    name: name || undefined,
    courseCode: courseCode || undefined,
    page,
    pageSize,
    sortBy: "CreatedAt",
    sortDirection: "desc",
  });

  // lần đầu load + mỗi khi filter/page đổi thì fetch
  useEffect(() => {
    const params = buildParams();
    fetchMyCourses(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, name, courseCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // reset về page 1 mỗi lần search
    setPage(1);
    const params = buildParams();
    fetchMyCourses(params, true);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePrev = () => {
    if (page <= 1) return;
    const nextPage = page - 1;
    setPage(nextPage);
  };

  const handleNext = () => {
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My Courses (Lecturer)
          </h1>
          <p className="text-sm text-slate-500">
            Manage all courses where you are the lecturer.
          </p>
        </div>
      </header>

      {/* Filters */}
      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-1 min-w-[220px] flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Course name
          </label>
          <input
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
            placeholder="Search by course name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-1 min-w-[180px] flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Course code
          </label>
          <input
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
            placeholder="Search by code..."
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="h-9 rounded-lg px-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Courses ({totalCount})
        </div>

        {loading && listData.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            Loading courses...
          </div>
        ) : listData.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            No courses found.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {listData.map((course) => (
              <li
                key={course.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {course.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {course.courseCode}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {course.description || "No description"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Term {course.term} {course.year} ·{" "}
                    {course.enrollmentCount} students
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {course.requiresAccessCode && course.accessCode && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Access code enabled
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
            <span>
              Page {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
