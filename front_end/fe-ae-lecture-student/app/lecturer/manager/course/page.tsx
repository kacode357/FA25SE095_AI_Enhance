"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  GitPullRequest,
  HardDriveDownload,
  Home,
  LayoutGrid,
  Loader2,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { useDeleteCourse } from "@/hooks/course/useDeleteCourse";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useImportTemplate } from "@/hooks/enrollments/useImportTemplate";

import { CourseItem } from "@/types/courses/course.response";
import CourseCard from "./components/CourseCard";
import CourseRequests from "./components/CourseRequests";
// CreateDialog replaced by standalone create page
import EditDialog from "./components/EditDialog";
import FilterBar from "./components/FilterBar";
// ImportDialog replaced by standalone import page
import { useAuth } from "@/contexts/AuthContext";

function InnerFooter() {
  return (
    <div className="mt-4 border-t z-50 border-slate-200 bg-white py-5 text-center text-[11px] text-slate-500">
      AIDS-LMS • Lecturer • Courses
    </div>
  );
}

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
  const { downloadImportTemplate, loading: downloading } = useImportTemplate();
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

  // tab control (outer)
  const [activeTab, setActiveTab] = useState<"courses" | "requests">("courses");
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
    <div className="">
      <div className="relative">
        {/* ======== Left Sidebar (fixed, full height under header) ======== */}
        <aside
          className="fixed left-0 top-16 bottom-0 w-[270px] z-20 overflow-y-auto border-r border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
        >
          <div className="h-full px-2 py-2 flex flex-col gap-3">
            {/* Navigation */}
            <Card className="p-3 gap-5 border-slate-200">
              <div className=" flex items-center gap-2 text-slate-800">
                <Sparkles className="size-4 text-brand" />
                <h2 className="text-sm font-semibold">Menu</h2>
              </div>
              <nav aria-label="Sidebar" className="-mx-1">
                <ul className="space-y-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveTab("courses")}
                      className={`group w-full rounded-md px-2.5 py-2 text-sm flex items-center gap-2 transition
                        ${
                          activeTab === "courses"
                            ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                            : "text-slate-700 hover:bg-slate-100"
                        }
                      `}
                    >
                      <BookOpen
                        className={`size-4 transition-colors ${
                          activeTab === "courses" ? "text-brand" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="flex-1 text-left">Manager Courses</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </Card>

            {/* Actions */}
            <Card className="p-3 border-slate-200">
              <div className="text-sm font-semibold text-slate-800">Quick Actions</div>
              <div className="flex flex-col gap-2">
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
                  <div className="text-sm font-medium text-brand">Import enrollments</div>
                  <p className="mt-3 text-xs text-slate-600">1) Download template</p>
                  <p className="mt-2 text-xs text-slate-600"> 2) Upload completed file</p>
                  <div className="mt-8 grid grid-cols-1 gap-2">
                    <Button
                      onClick={downloadImportTemplate}
                      disabled={downloading}
                      variant="outline"
                      className="h-8 gap-1 rounded-lg border-brand text-brand hover:bg-brand/5"
                    >
                      <HardDriveDownload className="size-4" />
                      {downloading ? "Loading" : "Template"}
                    </Button>
                    <Button
                      className="h-8 gap-1 rounded-sm btn btn-gradient-slow text-white"
                      onClick={() => router.push("/lecturer/manager/course/import")}
                    >
                      <Upload className="size-4" />
                      Import
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lecturer profile */}
            <Card className="px-2 -py-1 border-none shadow-none mt-auto">
              <div className="flex pt-2 items-center border-t border-slate-200 gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white grid place-items-center font-semibold">
                  {(() => {
                    const fn = (user?.firstName || "").trim();
                    const ln = (user?.lastName || "").trim();
                    const a = fn.charAt(0) || user?.email?.charAt(0) || "?";
                    const b = ln.charAt(0) || fn.charAt(1) || "";
                    return (a + b).toUpperCase();
                  })()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {(() => {
                      const fn = (user?.firstName || "").trim();
                      const ln = (user?.lastName || "").trim();
                      const name = [fn, ln].filter(Boolean).join(" ");
                      return name || (user as any)?.name || user?.email || "Lecturer";
                    })()}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user?.email || "—"}</div>
                </div>
              </div>
            </Card>
          </div>
        </aside>

        {/* ======== Center content (shifted right of sidebar) ======== */}
        <div className="pl-[270px] bg-slate-50 h-[calc(100vh-4rem)] overflow-hidden">
          <div className="flex h-full flex-col bg-slate-50">
            <div className="flex-1 min-h-0">
              {activeTab === "courses" && (
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
                </div>
              )}
            </div>
            {/* Page footer under all inner content */}
            <InnerFooter />
          </div>
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
  );
}
