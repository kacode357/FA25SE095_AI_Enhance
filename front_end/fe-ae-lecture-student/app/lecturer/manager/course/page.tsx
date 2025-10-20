"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  HardDriveDownload,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { useDeleteCourse } from "@/hooks/course/useDeleteCourse";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useImportTemplate } from "@/hooks/enrollments/useImportTemplate";

import { CourseItem } from "@/types/courses/course.response";
import CourseCard from "./components/CourseCard";
import CourseRequests from "./components/CourseRequests";
import CreateDialog from "./components/CreateDialog";
import EditDialog from "./components/EditDialog";
import FilterBar from "./components/FilterBar";
import ImportDialog from "./components/ImportDialog";

export default function CoursesPage() {
  const { listData, totalCount, currentPage, loading, fetchMyCourses } =
    useMyCourses();
  const { deleteCourse } = useDeleteCourse();
  const { downloadImportTemplate, loading: downloading } = useImportTemplate();
  const { listData: reqs } = useMyCourseRequests();

  // dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openImportEnrollments, setOpenImportEnrollments] = useState(false);
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
    <div className="p-4">
      <div
        className={`grid grid-cols-1 ${
          activeTab === "courses" ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""
        } gap-2 h-[calc(100vh-1rem)] overflow-hidden transition-all duration-300`}
      >
        {/* ======== Left content ======== */}
        <div className="flex flex-col overflow-y-auto pr-2 scroll-smooth" style={{ scrollbarGutter: "stable" }}>
          {/* Header */}
          <div className="sticky top-0 bg-white z-20 pb-2 border-b border-slate-100">
            <header className="flex flex-col gap-1 mb-2">
              <h1 className="text-xl font-semibold text-slate-800">
                {activeTab === "courses" ? "My Courses" : "Course Requests"}
              </h1>
              <p className="text-sm text-slate-600">
                {activeTab === "courses"
                  ? "View, edit, and manage your courses."
                  : "View and manage your course registration requests."}
              </p>
            </header>

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
                onApply={() => fetchAll(1, true)}
                onClear={() => {
                  setFilterName("");
                  setFilterCode("");
                  setCreatedAfter("");
                  setCreatedBefore("");
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
                  <Loader2 className="animate-spin text-blue-600 size-6" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("courses")}
                className="flex items-center mb-2 text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <CourseRequests active />
            </div>
          )}
        </div>

        {/* ======== Right Sidebar ======== */}
        {activeTab === "courses" && (
          <div className="flex flex-col gap-4 w-full">
            {/* Import Enrollments */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-blue-700">
                Import Enrollments
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                Upload a file to import students into multiple courses. Download
                the template to get started.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={downloadImportTemplate}
                  disabled={downloading}
                  variant="outline"
                  className="border-blue-500 text-sm text-blue-600 hover:bg-blue-50 rounded-2xl"
                >
                  <HardDriveDownload className="size-4 mr-2" />
                  {downloading ? "Downloading..." : "Download Template"}
                </Button>

                <Dialog
                  open={openImportEnrollments}
                  onOpenChange={setOpenImportEnrollments}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-sm text-white rounded-2xl">
                      <Upload className="size-4 mr-2" />
                      Import Enrollments
                    </Button>
                  </DialogTrigger>
                  <ImportDialog
                    title="Import Enrollments"
                    courses={filtered}
                    onSubmit={async () => {
                      await fetchAll(currentPage, true);
                      setOpenImportEnrollments(false);
                    }}
                    onCancel={() => setOpenImportEnrollments(false)}
                  />
                </Dialog>
              </div>
            </Card>

            {/* Create Course */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-emerald-700 mb-2">
                Create Course
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                Start a new course and manage enrollments instantly.
              </p>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 text-sm hover:bg-emerald-700 text-white rounded-2xl">
                    <Plus className="size-4 mr-2" />
                    Create Course
                  </Button>
                </DialogTrigger>
                <CreateDialog
                  title="Create New Course"
                  onSubmit={async () => {
                    await fetchAll(1, true);
                    setOpenCreate(false);
                  }}
                  onCancel={() => setOpenCreate(false)}
                />
              </Dialog>
            </Card>

            {/* Course Requests */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">
                Course Requests
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                View and send new private course registration requests to staff.
              </p>
              <Button
                variant="outline"
                className="text-slate-700 border-slate-400 hover:bg-slate-50 rounded-2xl"
                onClick={() => setActiveTab("requests")}
              >
                View Requests
              </Button>
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
