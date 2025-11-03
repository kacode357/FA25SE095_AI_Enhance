"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  HardDriveDownload,
  Loader2,
  Plus,
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

export default function CoursesPage() {
  const router = useRouter();
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

  // tab control
  const [activeTab, setActiveTab] = useState<"courses" | "requests">("courses");

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
    <div className="px-4 pb-4 pt-2">
      {/* Hero header */}
      <div className="relative overflow-hidden mb-4 rounded-2xl border border-slate-200 shadow-[0_8px_28px_rgba(2,6,23,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b] opacity-90" />
        <div className="relative px-4 sm:px-5 py-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Lecturer • Courses</h1>
            <p className="text-xs sm:text-sm text-white/90">Manage courses, enrollments, and requests with a polished workflow.</p>
          </div>
          {/* Segmented tabs */}
          <div className="bg-white/10 backdrop-blur px-1 py-1 rounded-xl inline-flex border border-white/20">
            <button
              onClick={() => setActiveTab("courses")}
              className={`${activeTab === "courses" ? "bg-white text-[#7f71f4] shadow" : "text-white/90 hover:text-white"} px-3 py-1.5 rounded-lg text-sm font-semibold transition`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`${activeTab === "requests" ? "bg-white text-[#7f71f4] shadow" : "text-white/90 hover:text-white"} px-3 py-1.5 rounded-lg text-sm font-semibold transition`}
            >
              Requests
            </button>
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${activeTab === "courses" ? "xl:grid-cols-[minmax(0,1fr)_360px]" : ""} gap-3 h-[calc(100vh-8.5rem)] overflow-hidden transition-all duration-300`}
      >
        {/* ======== Left content ======== */}
        <div className="flex flex-col overflow-y-auto pr-2 scroll-smooth scrollbar-stable">
          {/* Header */}
          <div className="sticky top-0 bg-white/70 backdrop-blur z-20 pb-2 border-b border-slate-100">
            {activeTab === "courses" && (
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
            )}
          </div>

          {/* ======== Courses Tab ======== */}
          {activeTab === "courses" && (
            <>
              {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 mt-2">
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
            </>
          )}

          {/* ======== Requests Tab ======== */}
          {activeTab === "requests" && (
            <div className="mt-2">
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("courses")}
                  className="flex items-center mb-2 text-sm text-slate-700 hover:text-slate-900"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                {/* Actions bar */}
                <div className="mb-2 flex items-center justify-end">
                  <Button className="btn btn-gradient text-white h-8 px-3 text-sm" onClick={() => router.push("/lecturer/manager/course/requests/create")}>
                    <Plus className="size-4" />
                    New Request
                  </Button>
                </div>
              </div>
              <CourseRequests active />
            </div>
          )}
        </div>

        {/* ======== Right Sidebar ======== */}
        {activeTab === "courses" && (
          <div className="flex flex-col gap-4 w-full xl:pl-1 sticky top-0 h-[calc(100vh-8.5rem)] overflow-y-auto scroll-smooth scrollbar-stable">
            {/* Quick actions */}
            <Card className="p-4 border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
              <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
              <p className="text-sm text-slate-600">
                Create a course or import students using the template.
              </p>
              <div className="flex flex-col justify-end sm:flex-row">
                <Button
                  onClick={() => router.push("/lecturer/manager/course/create")}
                  className="text-sm btn btn-gradient-slow text-white w-full sm:w-auto"
                >
                  <Plus className="size-4" />
                  Create Course
                </Button>
              </div>
            </Card>

            {/* Bulk import enrollments */}
            <Card className="p-4 border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
              <h2 className="text-base font-semibold text-brand">Import Enrollments</h2>
              <p className="text-sm text-slate-600">
                Add students in two quick steps: download the template and upload the completed file.
              </p>
              <ol className="space-y-2">
                <li className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-700">
                    <span className="font-medium">Step 1:</span> Download the template
                  </div>
                  <Button
                    onClick={downloadImportTemplate}
                    disabled={downloading}
                    variant="outline"
                    className="text-sm rounded-2xl border-brand text-brand hover:bg-brand/5"
                  >
                    <HardDriveDownload className="size-4" />
                    {downloading ? "Downloading..." : "Template"}
                  </Button>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-700">
                    <span className="font-medium">Step 2:</span> Upload the completed file
                  </div>
                  <Button
                    className="btn btn-gradient-slow text-sm text-white rounded-2xl"
                    onClick={() => router.push("/lecturer/manager/course/import")}
                  >
                    <Upload className="size-4 mr-2" />
                    Import
                  </Button>
                </li>
              </ol>
            </Card>

            {/* Course requests overview */}
            <Card className="p-4 border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
              <h2 className="text-base font-semibold text-brand flex items-center gap-2">
                Course Requests
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#7f71f4]/10 to-[#f4a23b]/10 text-[#7f71f4]">
                  {requestsCount} pending
                </span>
              </h2>
              <p className="text-sm text-slate-600">
                View and submit private course opening requests to the admin team.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-brand text-sm border-brand hover:bg-brand/5 rounded-2xl"
                  onClick={() => setActiveTab("requests")}
                >
                  View Requests
                </Button>
                {/* <Button
                  onClick={() => router.push("/lecturer/manager/course/requests/create")}
                  className="rounded-2xl btn btn-gradient-slow text-sm text-white"
                >
                  New Request
                </Button> */}
              </div>
            </Card>
          </div>
        )}
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
