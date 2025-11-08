"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ChevronRight,
  GitPullRequest,
  Home,
  LayoutGrid,
  Loader2,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { useDeleteCourse } from "@/hooks/course/useDeleteCourse";
import { useMyCourses } from "@/hooks/course/useMyCourses";

import { CourseItem } from "@/types/courses/course.response";
import CourseCard from "./components/CourseCard";
import CourseRequests from "./components/CourseRequests";
// CreateDialog replaced by standalone create page
import EditDialog from "./components/EditDialog";
import FilterBar from "./components/FilterBar";
// ImportDialog replaced by standalone import page
import { useAuth } from "@/contexts/AuthContext";

function Breadcrumb({
  courseMenu,
  onNavigateCourses,
  onSelectAll,
  onSelectRequests,
  router,
}: {
  courseMenu: "all" | "course-requests";
  onNavigateCourses: () => void;
  onSelectAll: () => void;
  onSelectRequests: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const isRequests = courseMenu === "course-requests";
  return (
    <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden">
      <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
        <li>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-slate-500 hover:text-brand transition shrink-0"
          >
            <Home className="size-3.5" />
            <span className="sr-only sm:not-sr-only sm:inline">Home</span>
          </button>
        </li>
        <ChevronRight className="size-3 text-slate-400" />
        <li>
          <button
            onClick={onNavigateCourses}
            className="px-1 py-0.5 rounded hover:text-brand transition max-w-[110px] truncate"
          >
            Lecturer
          </button>
        </li>
        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
        <li className="hidden sm:inline">
          <button
            onClick={onSelectAll}
            className="px-1 py-0.5 rounded hover:text-brand transition max-w-[130px] truncate"
          >
            Manager Courses
          </button>
        </li>
        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
        <li className="font-medium text-slate-900 max-w-[130px] truncate">
          {isRequests ? (
            <button
              onClick={onSelectRequests}
              className="px-1 py-0.5 rounded hover:text-brand transition max-w-[130px] truncate"
            >
              Course Request
            </button>
          ) : (
            <button
              onClick={onSelectAll}
              className="px-1 py-0.5 rounded hover:text-brand transition max-w-[130px] truncate"
            >
              All Courses
            </button>
          )}
        </li>
      </ol>
    </nav>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { listData, totalCount, currentPage, loading, fetchMyCourses } =
    useMyCourses();
  const { deleteCourse } = useDeleteCourse();
  const { listData: reqs } = useMyCourseRequests();
  const requestsCount = (reqs ?? []).length;

  // dialogs
  const [editCourse, setEditCourse] = useState<CourseItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // filters
  const [filterName, setFilterName] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [minEnroll, setMinEnroll] = useState<string>("");
  const [maxEnroll, setMaxEnroll] = useState<string>("");

  // removed outer activeTab (handled by route now)
  // inner menu inside Course screen
  const [courseMenu, setCourseMenu] = useState<"all" | "course-requests">("all");

  const fetchAll = async (page: number = 1, force: boolean = false) => {
    await fetchMyCourses(
      {
        asLecturer: true,
        page,
        pageSize: 10,
        sortBy: "CreatedAt",
        sortDirection: "desc",
        name: filterName || undefined,
        courseCode: filterCode || undefined,
        createdAfter: createdAfter || undefined,
        createdBefore: createdBefore || undefined,
        minEnrollmentCount: minEnroll !== "" ? Number(minEnroll) : undefined,
        maxEnrollmentCount: maxEnroll !== "" ? Number(maxEnroll) : undefined,
      },
      force
    );
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => listData, [listData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCourse(deleteId);
    if (res?.success) await fetchAll(currentPage, true);
    setDeleteId(null);
  };

  return (
    <div className="flex-1 min-h-0">
      <div className="">
                  <div className="sticky top-0 z-30 backdrop-blur w-full pl-3 pr-8.5 py-3 flex items-center justify-between">
                    <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">Courses Management</h1>
                    <Breadcrumb
                      courseMenu={courseMenu}
                      router={router}
                      onNavigateCourses={() => router.push("/lecturer/manager/course")}
                      onSelectAll={() => setCourseMenu("all")}
                      onSelectRequests={() => setCourseMenu("course-requests")}
                    />
                  </div>
                  <div className="grid h-[calc(100vh-4rem-3.25rem)] grid-cols-[200px_minmax(0,1fr)] gap-1.5">
                    {/* Inner sidebar inside Course screen */}
                    <div className="self-start h-full pl-3">
                      <Card className="p-3 h-full rounded-sm border-slate-200 flex flex-col">
                          <Button
                            onClick={() => router.push("/lecturer/manager/course/create")}
                            className="btn btn-gradient text-white"
                            size="sm"
                          >
                            <Plus className="size-4" />
                            Create Course
                          </Button>
                        <div className="mt-3 -mx-1">
                          <nav aria-label="Course menu">
                            <ul className="space-y-3">
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setCourseMenu("all")}
                                  className={`group w-full rounded-md px-2.5 py-1.5 text-[13px] flex items-center gap-2 transition
                                    ${
                                      courseMenu === "all"
                                        ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                        : "text-slate-700 hover:bg-slate-100"
                                    }
                                  `}
                                >
                                  <LayoutGrid
                                    className={`size-4 transition-colors ${
                                      courseMenu === "all" ? "text-brand" : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                                  />
                                  <span className="flex-1 text-left">All Courses</span>
                                </button>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setCourseMenu("course-requests")}
                                  className={`group w-full rounded-md px-2.5 py-1.5 text-[13px] flex items-center gap-2 transition
                                    ${
                                      courseMenu === "course-requests"
                                        ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                        : "text-slate-700 hover:bg-slate-100"
                                    }
                                  `}
                                >
                                  <GitPullRequest
                                    className={`size-4 transition-colors ${
                                      courseMenu === "course-requests" ? "text-brand" : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                                  />
                                  <span className="flex-1 text-left">Course Request</span>
                                  {requestsCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                      {requestsCount}
                                    </span>
                                  )}
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </Card>
                    </div>

                    {/* Right content for inner menu */}
                    <div className="flex min-h-0 flex-col h-full mr-9.5 border border-slate-200 rounded-sm p-2">
                      {courseMenu === "all" && (
                        <>
                          <div className="mb-3">
                            <Card className="p-0 rounded-sm border-none shadow-none">
                              <FilterBar
                                filterName={filterName}
                                setFilterName={setFilterName}
                                filterCode={filterCode}
                                setFilterCode={setFilterCode}
                                createdAfter={createdAfter}
                                setCreatedAfter={setCreatedAfter}
                                createdBefore={createdBefore}
                                setCreatedBefore={setCreatedBefore}
                                minEnroll={minEnroll}
                                setMinEnroll={setMinEnroll}
                                maxEnroll={maxEnroll}
                                setMaxEnroll={setMaxEnroll}
                                onApply={() => fetchAll(1, true)}
                                onClear={() => {
                                  setFilterName("");
                                  setFilterCode("");
                                  setCreatedAfter("");
                                  setCreatedBefore("");
                                  setMinEnroll("");
                                  setMaxEnroll("");
                                  fetchAll(1, true);
                                }}
                                resultCount={filtered.length}
                                totalCount={totalCount}
                                loading={loading}
                              />
                            </Card>
                          </div>

                          {/* Scroll area: only the course list scrolls */}
                          <div className="flex-1 overflow-y-auto scroll-smooth">
                            {!loading && filtered.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2 mb-15 pr-3">
                                {filtered.map((c) => (
                                  <motion.div key={c.id}>
                                    <CourseCard
                                      course={c}
                                      onEdit={() => setEditCourse(c)}
                                      onDelete={() => setDeleteId(c.id)}
                                      onUpdated={() => fetchAll(currentPage, true)}
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {loading && (
                              <div className="flex justify-center items-center py-10">
                                <Loader2 className="animate-spin text-brand size-6" />
                              </div>
                            )}

                            {!loading && filtered.length === 0 && (
                              <div className="text-center text-slate-500 py-8 text-sm">
                                No courses found.
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {courseMenu === "course-requests" && (
                        <div className="flex h-full flex-col">
                          <div className="flex-1 overflow-y-auto">
                            <CourseRequests active />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

        {/* ======== Edit Dialog ======== */}
        {editCourse && (
          <Dialog open={!!editCourse} onOpenChange={() => setEditCourse(null)}>
            <EditDialog
              title="Edit Course"
              course={editCourse}
              onSubmit={async () => {
                await fetchAll(currentPage, true);
                setEditCourse(null);
              }}
              onCancel={() => setEditCourse(null)}
            />
          </Dialog>
        )}
      </div>
    </div>
  );
}
