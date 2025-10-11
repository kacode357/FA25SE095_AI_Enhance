"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CourseRequests from "./components/CourseRequests";

import { useDeleteCourse } from "@/hooks/course/useDeleteCourse";
import { useMyCourses } from "@/hooks/course/useMyCourses";

import { CourseItem } from "@/types/courses/course.response";
import CourseCard from "./components/CourseCard";
import CreateDialog from "./components/CreateDialog";
import DeleteConfirm from "./components/DeleteConfirm";
import EditDialog from "./components/EditDialog";
import FilterBar from "./components/FilterBar";
import ImportDialog from "./components/ImportDialog";

export default function CoursesPage() {
  const { listData, totalCount, currentPage, loading, fetchMyCourses } = useMyCourses();
  const { deleteCourse, loading: deleting } = useDeleteCourse();

  const [openCreate, setOpenCreate] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // filters (KHÔNG còn filter theo lecturerName)
  const [filterName, setFilterName] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [minEnroll, setMinEnroll] = useState<string>(""); // number-as-string để dễ input
  const [maxEnroll, setMaxEnroll] = useState<string>("");

  // Course Requests state
  const { listData: reqs, totalCount: reqTotal, currentPage: reqPage, pageSize: reqPageSize, loading: loadingReqs, fetchMyCourseRequests } = useMyCourseRequests();
  const [reqPageState, setReqPageState] = useState(1);
  const [activeTab, setActiveTab] = useState<"courses" | "requests">("courses");

  // Fetch course requests when tab is active and page changes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => listData, [listData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCourse(deleteId);
    if (res?.success) await fetchAll(currentPage, true);
    setDeleteId(null);
  };

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col gap-3">
        {/* Header */}
        <header className="sticky top-0 z-20 flex flex-col gap-3 bg-white/90 p-2 rounded-md border border-slate-200">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="requests">Course Requests</TabsTrigger>
          </TabsList>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
              Manage your courses and requests.
          </p>

          <div className="flex items-center gap-2">
            {/* Import Enrollments */}
            <Dialog open={openImport} onOpenChange={setOpenImport}>
              <DialogTrigger asChild>
                <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
                  <Upload className="size-4" />
                  Import Enrollments
                </Button>
              </DialogTrigger>
              <ImportDialog
                title="Import Enrollments"
                onSubmit={async () => {
                  await fetchAll(currentPage, true);
                  setOpenImport(false);
                }}
                onCancel={() => setOpenImport(false)}
              />
            </Dialog>

            {/* Create Course */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                  <Plus className="size-4" />
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
          </div>
        </div>
          {/* Filters (only for Courses tab) */}
          <TabsContent value="courses">
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
          </TabsContent>
        </header>

        {/* Courses content */}
        <TabsContent value="courses" className="flex-1 cursor-pointer">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-44 animate-pulse bg-slate-50 border-slate-200" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="h-[40vh] grid place-items-center">
              <div className="text-center text-slate-500">No courses found.</div>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {filtered.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
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
        </TabsContent>

        {/* Course Requests content */}
        <TabsContent value="requests" className="flex-1 cursor-pointer">
          <CourseRequests active={activeTab === "requests"} />
        </TabsContent>

      </Tabs>

      {/* Edit / Delete */}
      <Dialog open={!!editCourse} onOpenChange={(o) => !o && setEditCourse(null)}>
        {editCourse && (
          <EditDialog
            course={editCourse}
            title="Edit Course"
            onSubmit={async () => {
              await fetchAll(currentPage, true);
              setEditCourse(null);
            }}
            onCancel={() => setEditCourse(null)}
          />
        )}
      </Dialog>

      <DeleteConfirm
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
