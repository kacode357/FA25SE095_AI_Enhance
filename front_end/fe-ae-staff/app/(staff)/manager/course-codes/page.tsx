"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";
import { useDeleteCourseCode } from "@/hooks/course-code/useDeleteCourseCode";

import CreateDialog from "./components/CreateDialog";
import EditDialog from "./components/EditDialog";
import DeleteConfirm from "./components/DeleteConfirm";
import FilterRow from "./components/FilterRow";

import { CourseCode } from "@/types/course-codes/course-codes.response";

export default function CourseCodesPage() {
  const { listData, totalCount, currentPage, pageSize, loading, fetchCourseCodes } = useCourseCodes();
  const { deleteCourseCode, loading: deleting } = useDeleteCourseCode();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [filterCode, setFilterCode] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [filterActive, setFilterActive] = useState(""); // ✅ thêm filter Active

  const [courseCodes, setCourseCodes] = useState<CourseCode[]>([]);

  // Fetch all with filters
  const fetchAll = async (page = 1) => {
    await fetchCourseCodes({
      page,
      pageSize: 10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      code: filterCode || undefined,
      title: filterTitle || undefined,
      department: filterDept || undefined,
      createdAfter: createdAt || undefined,
      isActive: filterActive === "" ? undefined : filterActive === "true", // ✅ thêm filter active
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setCourseCodes(listData);
  }, [listData]);

  const filtered = useMemo(() => courseCodes, [courseCodes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCourseCode(deleteId);
    if (res?.success) {
      await fetchAll(currentPage);
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
            Create, manage, and track your course codes.
          </p>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                <Plus className="size-4" />
                Create Course Code
              </Button>
            </DialogTrigger>
            <CreateDialog
              title="Create New Course Code"
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
            Course Code List <span className="text-slate-500">({totalCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  {/* CODE: Căn trái */}
                  <TableHead className="w-28 text-left font-bold pl-5">Code</TableHead>
                  {/* TITLE: Căn trái */}
                  <TableHead className="w-56 text-left font-bold">Title</TableHead>
                  {/* DEPARTMENT: Căn trái */}
                  <TableHead className="w-44 text-left font-bold">Department</TableHead>
                  <TableHead className="w-28 text-center font-bold">Active</TableHead>
                  <TableHead className="w-36 text-center font-bold">Created At</TableHead>
                  <TableHead className="w-32 text-center font-bold">Actions</TableHead>
                </TableRow>

                <FilterRow
                  filterCode={filterCode} setFilterCode={setFilterCode}
                  filterTitle={filterTitle} setFilterTitle={setFilterTitle}
                  filterDept={filterDept} setFilterDept={setFilterDept}
                  createdAt={createdAt} setCreatedAt={setCreatedAt}
                  filterActive={filterActive} setFilterActive={setFilterActive} // ✅ truyền filter Active
                  fetchAll={fetchAll}
                  clearAll={() => {
                    setFilterCode("");
                    setFilterTitle("");
                    setFilterDept("");
                    setCreatedAt("");
                    setFilterActive(""); // ✅ reset luôn
                    fetchAll();
                  }}
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
                    {/* CODE: Căn trái, thêm padding */}
                    <TableCell className="text-left pl-5">{c.code}</TableCell>
                    {/* TITLE: Căn trái */}
                    <TableCell className="text-left">{c.title}</TableCell>
                    {/* DEPARTMENT: Căn trái */}
                    <TableCell className="text-left">{c.department}</TableCell>
                    <TableCell className="text-center">
                      {c.isActive ? (
                        <span className="text-emerald-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-slate-500">Inactive</span>
                      )}
                    </TableCell>
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
                              courseCodeId={c.id}
                              title="Edit Course Code"
                              onSubmit={async () => {
                                await fetchAll(currentPage);
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
                      No course codes found.
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