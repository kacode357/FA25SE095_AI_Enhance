"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useDeleteCourse } from "@/hooks/course/useDeleteCourse";
import CreateDialog from "./components/CreateDialog";
import EditDialog from "./components/EditDialog";
import FilterRow from "./components/FilterRow";
import DeleteConfirm from "./components/DeleteConfirm";

import { CourseItem } from "@/types/courses/course.response";

export default function CoursePage() {
  const { listData, totalCount, loading, fetchMyCourses } = useMyCourses();
  const { deleteCourse, loading: deleting } = useDeleteCourse();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const fetchAll = async () => {
    await fetchMyCourses({
      asLecturer: true,
      page: 1,
      pageSize: 10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      courseCode: filterCode || undefined,
      name: filterName || undefined,
      createdAfter: createdAt || undefined,
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setCourses(listData);
  }, [listData]);

  const filtered = useMemo(() => courses, [courses]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCourse(deleteId);
    if (res?.success) {
      await fetchAll();
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
            Create, manage, and track your courses.
          </p>
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
                await fetchAll();
                setOpenCreate(false);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </Dialog>
        </div>
      </header>

      {/* Table */}
      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Course List <span className="text-slate-500">({totalCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="w-32 text-center font-bold">Code</TableHead>
                  <TableHead className="w-64 text-center font-bold">Name</TableHead>
                  <TableHead className="w-40 text-center font-bold">Lecturer</TableHead>
                  <TableHead className="w-28 text-center font-bold">Enrollments</TableHead>
                  <TableHead className="w-40 text-center font-bold">Created At</TableHead>
                  <TableHead className="w-32 text-center font-bold">Actions</TableHead>
                </TableRow>

                <FilterRow
                  filterCode={filterCode} setFilterCode={setFilterCode}
                  filterName={filterName} setFilterName={setFilterName}
                  createdAt={createdAt} setCreatedAt={setCreatedAt}
                  fetchAll={fetchAll}
                  clearAll={() => {
                    setFilterCode(""); setFilterName(""); setCreatedAt("");
                    fetchAll();
                  }}
                  resultCount={filtered.length}
                />
              </TableHeader>

              <TableBody>
                {filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-slate-100 hover:bg-emerald-50/50"
                  >
                    <TableCell className="text-center">{c.courseCode}</TableCell>
                    <TableCell className="px-5">{c.name}</TableCell>
                    <TableCell className="text-center">{c.lecturerName}</TableCell>
                    <TableCell className="text-center">{c.enrollmentCount}</TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <Dialog open={openEditId === c.id} onOpenChange={(o) => setOpenEditId(o ? c.id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 px-2 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </DialogTrigger>
                          {openEditId === c.id && (
                            <EditDialog
                              courseId={c.id}
                              title="Edit Course"
                              onSubmit={async () => {
                                await fetchAll();
                                setOpenEditId(null);
                              }}
                              onCancel={() => setOpenEditId(null)}
                            />
                          )}
                        </Dialog>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No courses found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <DeleteConfirm
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
