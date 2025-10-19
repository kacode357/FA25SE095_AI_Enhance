// app/student/my-assignments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useMyAssignments } from "@/hooks/assignment/useMyAssignments";
import { useMyCourses } from "@/hooks/course/useMyCourses";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ListChecks,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CalendarClock,
  BookOpen,
  Users,
  Timer,
  Eye,
  X,
  Search,
} from "lucide-react";

import type { MyAssignmentsQuery } from "@/types/assignments/assignment.payload";
import {
  AssignmentStatus,
  GetMyAssignmentsResponse,
} from "@/types/assignments/assignment.response";
import type { GetMyCoursesQuery } from "@/types/courses/course.payload";
import type { CourseItem } from "@/types/courses/course.response";

export default function MyAssignmentsPage() {
  const router = useRouter();

  // Hooks
  const { listData, loading, fetchMyAssignments } = useMyAssignments();
  const { listData: myCourses, loading: loadingCourses, fetchMyCourses } = useMyCourses();

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

  // Handlers
  const onRefresh = () => fetchMyAssignments(query);
  const gotoDetail = (cid: string, aid: string) =>
    router.push(`/student/courses/${cid}/assignments/${aid}`);
  const onClearFilters = () => {
    setCourseId("");
    setCourseNameQuery("");
  };

  // UI helpers
  const statusTone = (s: AssignmentStatus) => {
    switch (s) {
      case AssignmentStatus.Active:
      case AssignmentStatus.Extended:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case AssignmentStatus.Overdue:
        return "bg-red-50 text-red-700 border-red-200";
      case AssignmentStatus.Closed:
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-GB") : "—");

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header (single Refresh button) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-green-600" />
          My Assignments
        </h1>

        <Button variant="secondary" onClick={onRefresh} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refreshing…
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Content 9/3 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: assignments */}
        <div className="md:col-span-9">
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-base">Your assignments</CardTitle>
                <p className="text-xs text-slate-500">
                  Total: <b>{total}</b> assignment{total > 1 ? "s" : ""}
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Loading */}
              {loading && (
                <div className="flex justify-center items-center py-10 text-green-700">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Loading assignments…</span>
                </div>
              )}

              {/* Empty */}
              {empty && (
                <div className="flex flex-col items-center py-10 text-slate-600">
                  <AlertTriangle className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="mb-1 text-sm text-center">You have no assignments.</p>
                  <p className="text-xs text-slate-500">Please check your courses again.</p>
                </div>
              )}

              {/* List */}
              {!loading && data && assignmentsToShow.length > 0 && (
                <ul className="space-y-4">
                  {assignmentsToShow.map((a) => {
                    const due = a.extendedDueDate ?? a.dueDate;

                    return (
                      <li key={a.id}>
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                          {/* Row 1 */}
                          <div className="px-4 pt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Left */}
                            <div className="md:col-span-7 min-w-0 flex items-center gap-3">
                              <span
                                className={
                                  "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border shrink-0 " +
                                  statusTone(a.status)
                                }
                                title={a.statusDisplay}
                              >
                                {a.statusDisplay}
                              </span>
                              <h3 className="text-base font-semibold text-slate-900 truncate">
                                {a.title}
                              </h3>
                            </div>

                            {/* Right */}
                            <div className="md:col-span-5 min-w-0 flex items-center justify-start md:justify-end gap-2 flex-wrap">
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 inline-flex items-center gap-1 shrink-0">
                                <Users className="w-3 h-3" />
                                {a.isGroupAssignment ? <>Group • {a.assignedGroupsCount}</> : <>Individual</>}
                              </span>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => gotoDetail(a.courseId, a.id)}
                                className="shrink-0"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View details
                              </Button>
                            </div>
                          </div>

                          {/* Row 2 */}
                          <div className="px-4 pb-4 pt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-12 min-w-0 flex flex-wrap items-center gap-3 text-sm">
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="w-4 h-4 text-green-600" />
                                Start: <b>{fmt(a.startDate)}</b>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="w-4 h-4 text-green-600" />
                                Due: <b>{fmt(due)}</b>
                              </span>
                              {a.extendedDueDate && (
                                <span className="text-xs text-slate-500">extended from {fmt(a.dueDate)}</span>
                              )}

                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5">
                                <BookOpen className="w-4 h-4" />
                                {a.maxPoints} pts
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5">
                                <Timer className="w-4 h-4" />
                                {a.daysUntilDue} days left
                              </span>

                              {a.isOverdue && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-red-700">
                                  <AlertTriangle className="w-4 h-4" />
                                  Overdue
                                </span>
                              )}

                              <span className="text-xs text-slate-500">
                                Course: <b>{a.courseName}</b>
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
                  <div className="text-sm text-slate-600">
                    Page <b>{data.pageNumber}</b> / {data.totalPages} • Total: <b>{data.totalCount}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={pageNumber <= 1}
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={pageNumber >= data.totalPages}
                      onClick={() => setPageNumber((p) => Math.min(data.totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Filter (Course + Course name search via API) */}
        <div className="md:col-span-3">
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Filter</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Course name (server-side search) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Course name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="Type to search courses…"
                    value={courseNameQuery}
                    onChange={(e) => setCourseNameQuery(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {loadingCourses ? "Searching…" : `${myCourses?.length ?? 0} course(s)`}
                </p>
              </div>

              {/* Course select (results filtered by Course name) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Course</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">— All courses —</option>
                    {myCourses?.map((c: CourseItem) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    ▾
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button type="button" variant="outline" onClick={onClearFilters} className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>

              <p className="text-[11px] text-slate-500">
                Select a course to filter assignments. Type a course name to search from the server.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
