"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Home,
  Loader2,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useDeleteCourse } from "@/hooks/course/useDeleteCourse";
import { useMyCourses } from "@/hooks/course/useMyCourses";

import { CourseItem } from "@/types/courses/course.response";
import CourseCard from "./components/CourseCard";
// CreateDialog replaced by standalone create page
import EditDialog from "./components/EditDialog";
import FilterBar from "./components/FilterBar";
// ImportDialog replaced by standalone import page
import { useAuth } from "@/contexts/AuthContext";

function Breadcrumb({ router }: { router: ReturnType<typeof useRouter> }) {
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
        <li className="px-1 py-0.5">Lecturer</li>
        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
        <li className="font-medium text-slate-900 max-w-[160px] truncate">All Courses</li>
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

  // removed inner sidebar; this page shows All Courses

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
        <div className="sticky top-0 z-30 backdrop-blur w-full pl-3 pr-5 py-3 flex items-center justify-between">
          <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">Courses Management</h1>
          {/* <Breadcrumb router={router} /> */}
          <div className="ml-auto">
            <Button
              onClick={() => router.push("/lecturer/course/create")}
              className="btn btn-gradient text-white"
              size="sm"
            >
              <Plus className="size-4" />
              Create Course
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-4rem-4.5rem)] border border-slate-200 rounded-sm mb-3 py-3 -mt-0 flex flex-col gap-2 mr-5 ml-3">
          <div className="mb-1">
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

          {/* Scroll area: course list */}
          <div className="flex-1 overflow-y-auto scroll-smooth rounded-sm px-2">
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-15">
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
