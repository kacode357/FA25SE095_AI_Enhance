// app/student/my-assignments/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useMyAssignments } from "@/hooks/assignment/useMyAssignments";
import { useMyCourses } from "@/hooks/course/useMyCourses";

import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ListChecks,
  Loader2,
  Search,
  Timer,
  Users,
  X,
} from "lucide-react";

import type { MyAssignmentsQuery } from "@/types/assignments/assignment.payload";
import {
  AssignmentStatus,
  GetMyAssignmentsResponse,
} from "@/types/assignments/assignment.response";
import type { GetMyCoursesQuery } from "@/types/courses/course.payload";
import type { CourseItem } from "@/types/courses/course.response";

import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { parseCourseName } from "@/utils/course/parse-course-name";

export default function MyAssignmentsPage() {
  const router = useRouter();

  // Hooks
  const { listData, loading, fetchMyAssignments } = useMyAssignments();
  const {
    listData: myCourses,
    loading: loadingCourses,
    fetchMyCourses,
  } = useMyCourses();

  // Local state
  const [courseId, setCourseId] = useState<string>("");
  const [courseNameQuery, setCourseNameQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Assignments query (payload)
  const query: MyAssignmentsQuery = useMemo(
    () => ({ pageNumber, pageSize }),
    [pageNumber, pageSize]
  );

  // Fetch assignments
  useEffect(() => {
    fetchMyAssignments(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.pageNumber, query.pageSize]);

  // Fetch courses (first load & whenever courseNameQuery changes)
  useEffect(() => {
    const q: GetMyCoursesQuery = {
      asLecturer: false,
      page: 1,
      pageSize: 100,
      sortBy: "Name",
      sortDirection: "asc",
      name: courseNameQuery.trim() || undefined,
    };

    const t = setTimeout(() => {
      fetchMyCourses(q);
    }, 350); // debounce

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseNameQuery]);

  // Derived
  const data: GetMyAssignmentsResponse | null = listData;
  const total = data?.totalCount ?? 0;
  const empty = !loading && (!data || data.assignments.length === 0);

  // Client-side filter by selected course
  const assignmentsToShow = useMemo(() => {
    const items = data?.assignments ?? [];
    return courseId ? items.filter((a) => a.courseId === courseId) : items;
  }, [data, courseId]);

  // Helpers
  const gotoDetail = (cid: string, aid: string) =>
    router.push(`/student/courses/${cid}/assignments/${aid}`);

  const onClearFilters = () => {
    setCourseId("");
    setCourseNameQuery("");
  };

  const fmt = (iso?: string | null) => formatDateTimeVN(iso ?? undefined);

  const statusBadgeClass = (s: AssignmentStatus) => {
    switch (s) {
      case AssignmentStatus.Draft:
        return "badge-assignment badge-assignment--draft";
      case AssignmentStatus.Scheduled:
        return "badge-assignment badge-assignment--scheduled";
      case AssignmentStatus.Active:
        return "badge-assignment badge-assignment--active";
      case AssignmentStatus.Extended:
        return "badge-assignment badge-assignment--extended";
      case AssignmentStatus.Overdue:
        return "badge-assignment badge-assignment--overdue";
      case AssignmentStatus.Closed:
        return "badge-assignment badge-assignment--closed";
      case AssignmentStatus.Graded:
        return "badge-assignment badge-assignment--graded";
      default:
        return "badge-assignment";
    }
  };

  const formatCourseShort = (raw?: string | null) => {
    const parsed = parseCourseName(raw);
    if (!parsed.courseCode && !parsed.classCode && !parsed.lecturerName) {
      return raw ?? "—";
    }

    const parts = [parsed.courseCode, parsed.classCode, parsed.lecturerName].filter(
      Boolean
    );
    return parts.join(" · ");
  };

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
    <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-nav flex items-center gap-2">
    <ListChecks className="w-6 h-6 text-nav-active" />
    All Course Assignments
  </h1>
</div>

      {/* Content 9/3 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: assignments */}
        <div className="md:col-span-9">
          <div className="card rounded-2xl">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <div>
                <div className="text-base font-semibold text-nav">
                  Your assignments
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Total: <b>{total}</b> assignment{total > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="pt-3 p-4">
              {/* Loading */}
              {loading && (
                <div className="flex justify-center items-center py-10 text-nav">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Loading assignments…</span>
                </div>
              )}

              {/* Empty */}
              {empty && (
                <div className="flex flex-col items-center py-10 text-[var(--text-muted)]">
                  <AlertTriangle className="w-10 h-10 text-[var(--muted)] mb-2" />
                  <p className="mb-1 text-sm text-center">
                    You have no assignments.
                  </p>
                  <p className="text-xs">Please check your courses again.</p>
                </div>
              )}

              {/* List */}
              {!loading && data && assignmentsToShow.length > 0 && (
                <ul className="space-y-4">
                  {assignmentsToShow.map((a) => {
                    const due = a.extendedDueDate ?? a.dueDate;
                    const courseDisplay = formatCourseShort(a.courseName);

                    return (
                      <li key={a.id}>
                        <div
                          onClick={() => gotoDetail(a.courseId, a.id)}
                          className="cursor-pointer rounded-xl border border-[var(--border)] bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          {/* Row 1 */}
                          <div className="px-4 pt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Left */}
                            <div className="md:col-span-7 min-w-0 flex items-center gap-3">
                              <span
                                className={
                                  statusBadgeClass(a.status) +
                                  " shrink-0"
                                }
                                title={a.statusDisplay}
                              >
                                {a.statusDisplay}
                              </span>
                              <h3 className="text-base font-semibold text-foreground truncate">
                                {a.title}
                              </h3>
                            </div>

                            {/* Right */}
                            <div className="md:col-span-5 min-w-0 flex items-center justify-start md:justify-end gap-2 flex-wrap">
                              <span className="badge-assignment badge-assignment--group inline-flex items-center gap-1 shrink-0">
                                <Users className="w-3 h-3" />
                                {a.isGroupAssignment ? (
                                  <>Group • {a.assignedGroupsCount}</>
                                ) : (
                                  <>Individual</>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Row 2 */}
                          <div className="px-4 pb-4 pt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-12 min-w-0 flex flex-wrap items-center gap-3 text-sm">
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="w-4 h-4 text-nav-active" />
                                Start: <b>{fmt(a.startDate)}</b>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="w-4 h-4 text-nav-active" />
                                Due: <b>{fmt(due)}</b>
                              </span>
                              {a.extendedDueDate && (
                                <span className="text-xs text-[var(--text-muted)]">
                                  extended from {fmt(a.dueDate)}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-0.5">
                                <BookOpen className="w-4 h-4 text-nav-active" />
                                {a.maxPoints} pts
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-0.5">
                                <Timer className="w-4 h-4 text-nav-active" />
                                {a.daysUntilDue} days left
                              </span>

                              {a.isOverdue && (
                                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-accent border border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
                                  style={{
                                    background:
                                      "color-mix(in oklab, var(--accent) 16%, var(--white))",
                                  } as any}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                  Overdue
                                </span>
                              )}

                              <span className="text-xs text-[var(--text-muted)]">
                                Course:{" "}
                                <b className="text-foreground">
                                  {courseDisplay}
                                </b>
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Pagination */}
              {!loading && data && data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-[var(--text-muted)]">
                    Page <b>{data.pageNumber}</b> / {data.totalPages} • Total:{" "}
                    <b>{data.totalCount}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`btn bg-white border border-brand text-nav hover:text-nav-active ${
                        pageNumber <= 1 ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      disabled={pageNumber <= 1}
                      onClick={() =>
                        setPageNumber((p) => Math.max(1, p - 1))
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className={`btn bg-white border border-brand text-nav hover:text-nav-active ${
                        pageNumber >= data.totalPages
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={pageNumber >= data.totalPages}
                      onClick={() =>
                        setPageNumber((p) => Math.min(data.totalPages, p + 1))
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Filter (Course + Course name search via API) */}
        <div className="md:col-span-3">
          <div className="card rounded-2xl p-4">
            <div className="mb-2">
              <div className="text-base font-semibold text-nav">Filter</div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-nav">
                  Course name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    className="input pl-10"
                    placeholder="Type to search courses…"
                    value={courseNameQuery}
                    onChange={(e) => setCourseNameQuery(e.target.value)}
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {loadingCourses
                    ? "Searching…"
                    : `${myCourses?.length ?? 0} course(s)`}
                </p>
              </div>

              {/* Course select (results filtered by Course name) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-nav">Course</label>
                <div className="relative">
                  <select
                    title="Select"
                    className="input pr-8 appearance-none"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">— All courses —</option>
                    {myCourses?.map((c: CourseItem) => (
                      <option key={c.id} value={c.id}>
                        {formatCourseShort(c.name)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)]">
                    ▾
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="btn bg-white border border-brand text-nav hover:text-nav-active w-full"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>

              <p className="text-[11px] text-[var(--text-muted)]">
                Select a course to filter assignments. Type a course name to
                search from the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
