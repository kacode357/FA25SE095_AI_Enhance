"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";
import { useDeleteCourseCode } from "@/hooks/course-code/useDeleteCourseCode";

// Create dialog moved to a dedicated page at /staff/course-codes/create
import EditDialog from "./components/EditDialog";
import FilterRow from "./components/FilterRow";

import PaginationBar from "@/components/common/PaginationBar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CourseCode } from "@/types/course-codes/course-codes.response";
import DeleteConfirm from "./components/DeleteConfirm";

export default function CourseCodesPage() {
  const { listData, totalCount, currentPage, pageSize, loading, fetchCourseCodes } = useCourseCodes();
  const { deleteCourseCode, loading: deleting } = useDeleteCourseCode();

  // create dialog removed; navigate to a dedicated create page instead
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [filterCode, setFilterCode] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [filterActive, setFilterActive] = useState(""); // ✅ Active filter

  const [courseCodes, setCourseCodes] = useState<CourseCode[]>([]);
  const [page, setPage] = useState(1);

  // Dùng 10 như fetchAll đang cố định để đồng bộ phân trang
  const pageSizeFixed = 10;

  // Fetch with filters
  const fetchAll = async (p = 1) => {
    await fetchCourseCodes({
      page: p,
      pageSize: pageSizeFixed,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      code: filterCode || undefined,
      title: filterTitle || undefined,
      department: filterDept || undefined,
      createdAfter: createdAt || undefined,
      isActive: filterActive === "" ? undefined : filterActive === "true",
    });
    setPage(p);
  };

  useEffect(() => {
    fetchAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCourseCodes(listData);
  }, [listData]);

  // Sync page from hook (nếu hook có quản lý currentPage)
  useEffect(() => {
    if (typeof currentPage === "number" && currentPage > 0) {
      setPage(currentPage);
    }
  }, [currentPage]);

  const filtered = useMemo(() => courseCodes, [courseCodes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCourseCode(deleteId);
    if (res?.success) {
      await fetchAll(page); // giữ nguyên trang hiện tại sau khi xóa
    }
    setDeleteId(null);
  };

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / (pageSize ?? pageSizeFixed)));

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
            Create, manage, and track your course codes.
          </p>
          <Link href="/staff/course-codes/create">
            <Button className="h-9 bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white flex items-center gap-1">
              <Plus className="size-4" />
              Create Course Code
            </Button>
          </Link>
        </div>
      </header>

      {/* Table */}
      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Course Code List{" "}
            <span className="text-slate-500">
              ({typeof totalCount === "number" ? totalCount : 0})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="w-28 text-left font-bold pl-5">Code</TableHead>
                  <TableHead className="w-56 text-left font-bold">Title</TableHead>
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
                  filterActive={filterActive} setFilterActive={setFilterActive}
                  fetchAll={() => fetchAll(1)} // apply -> về trang 1
                  clearAll={() => {
                    setFilterCode("");
                    setFilterTitle("");
                    setFilterDept("");
                    setCreatedAt("");
                    setFilterActive("");
                    fetchAll(1);
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
                    <TableCell className="text-left pl-5">{c.code}</TableCell>
                    <TableCell className="text-left">{c.title}</TableCell>
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
                              className="h-8 px-2 text-emerald-600 cursor-pointer hover:bg-emerald-50"
                            >
                              <PencilLine className="size-4 text-blue-600" />
                            </Button>
                          </DialogTrigger>
                          {openEditId === c.id && (
                            <EditDialog
                              courseCodeId={c.id}
                              title="Edit Course Code"
                              onSubmit={async () => {
                                await fetchAll(page);
                                setOpenEditId(null);
                              }}
                              onCancel={() => setOpenEditId(null)}
                            />
                          )}
                        </Dialog>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-red-600 cursor-pointer hover:bg-red-50"
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

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount ?? 0}
          loading={loading}
          onPageChange={(p) => {
            if (p !== page) {
              fetchAll(p);
            }
          }}
        />
      </Card>

      {/* Delete Confirm Dialog */}
      <DeleteConfirm
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        loading={deleting}
        onConfirm={handleDelete}
        title="Confirm Delete"
        details={
          (() => {
            const sel = courseCodes.find((x) => x.id === deleteId);
            if (!sel) return null;
            return (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Code:</span>
                  <span className="font-medium text-slate-800">{sel.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Title:</span>
                  <span className="text-slate-800 truncate">{sel.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Department:</span>
                  <span className="text-slate-800">{sel.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Created:</span>
                  <span className="text-slate-800">{new Date(sel.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Status:</span>
                  <span className={sel.isActive ? "text-emerald-600 font-semibold" : "text-slate-500"}>{sel.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            );
          })()
        }
      />
    </div>
  );
}
