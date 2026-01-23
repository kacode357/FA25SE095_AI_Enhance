"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { cn } from "@/lib/utils";
import { Course } from "@/types/course/course.response";
import { formatToVN } from "@/utils/datetime/time";
import { motion } from "framer-motion";
import { Check, GraduationCap, Info, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FilterRow from "./components/FilterRow";

export default function CourseApprovalsPage() {
  const router = useRouter();
  const { listData, loading, fetchCourses } = useCourses();

  const [page, setPage] = useState(1);
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);

  // --- CONFIG DIALOG STATE (moved from courses page) ---
  const [showConfigureDialog, setShowConfigureDialog] = useState(false);
  const [selectedCourseForConfigure, setSelectedCourseForConfigure] = useState<string | null>(null);
  const [dialogSearchTerm, setDialogSearchTerm] = useState("");

  const dialogFilteredCourses = useMemo(() => {
    if (!dialogSearchTerm) return pendingCourses;
    const lowerTerm = dialogSearchTerm.toLowerCase();
    return pendingCourses.filter(
      (c) => c.name.toLowerCase().includes(lowerTerm) || c.courseCode.toLowerCase().includes(lowerTerm)
    );
  }, [pendingCourses, dialogSearchTerm]);

  // Filters
  const [name, setName] = useState("");
  const [lecturerName, setLecturerName] = useState("");

  const fetchAll = async (pageNum = 1) => {
    await fetchCourses({
      page: pageNum,
      pageSize: 10,
      status: 1, // Pending
      sortBy: "CreatedAt",
      sortDirection: "desc",
      name: name || undefined,
      lecturerName: lecturerName || undefined,
    });
  };

  useEffect(() => {
    fetchAll(page);
  }, [page]);

  useEffect(() => {
    if (listData?.courses) setPendingCourses(listData.courses);
  }, [listData]);

  const totalPages = listData?.totalPages || 1;
  const totalCount = listData?.totalCount || 0;

  return (
    <div className="min-h-full flex flex-col p-3 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 mb-4 bg-white/90 p-3 rounded-md border border-slate-200">
        <h1 className="text-lg font-semibold text-slate-800">Course Approvals</h1>
        <div className="flex items-center gap-2 mt-3">
          <Info className="size-4" />
          <p className="text-sm text-slate-500">
            Note: Review the <b>Weight</b> value assessment before approving. The Weight will be received from the <b>Course Code</b>  if not configured here.
          </p>
        </div>

      </header>

      {/* Table card */}
      <Card className="flex-1 border border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">
            Pending Course Approvals{" "}
            <span className="text-slate-500 text-sm">({totalCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <div className="overflow-auto">
            <Table className="table-auto w-full">
              {/* Header + Filter (no dark borders) */}
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="text-xs pl-4 font-bold w-1/4 text-left">Course Name</TableHead>
                  <TableHead className="text-xs font-bold w-1/5 text-left">Lecturer</TableHead>
                  <TableHead className="text-xs font-bold w-1/6 text-center">Term</TableHead>
                  {/* <TableHead className="text-xs font-bold w-1/6 text-center">Year</TableHead> */}
                  <TableHead className="text-xs font-bold w-1/6 text-center">Created At</TableHead>
                  <TableHead className="text-xs font-bold w-[120px] text-center">Action</TableHead>
                </TableRow>

                {/* Filter row đặt trong Header cho đồng bộ */}
                <FilterRow
                  name={name}
                  setName={setName}
                  lecturerName={lecturerName}
                  setLecturerName={setLecturerName}
                  onApply={() => fetchAll(1)}
                  onClear={() => {
                    setName("");
                    setLecturerName("");
                    fetchAll(1);
                  }}
                />
              </TableHeader>

              <TableBody>
                {
                  pendingCourses.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b text-xs border-slate-100 hover:bg-blue-50/40"
                    >
                      <TableCell className="pl-4 py-5 font-medium text-sm text-left">{c.courseCodeTitle}</TableCell>
                      <TableCell className="text-left">{c.lecturerName}</TableCell>
                      <TableCell className="text-center">{c.term}</TableCell>
                      {/* <TableCell className="text-center">{c.year}</TableCell> */}
                      <TableCell className="text-center text-xs whitespace-nowrap">
                        {formatToVN(c.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="h-8 btn btn-green-slow px-3 text-xs"
                          onClick={() => router.push(`/staff/course-approvals/${c.id}`)}
                        >
                          View Detail
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}

                {pendingCourses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No pending courses.
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- CONFIGURE TOPIC WEIGHT DIALOG (CUSTOM MODAL) --- */}
      {showConfigureDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowConfigureDialog(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Configure Topic Weights</h3>
                <p className="text-sm text-slate-500 mt-0.5">Select a course to proceed with configuration.</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setShowConfigureDialog(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Search */}
            <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by course name or code..."
                  className="pl-9 bg-white border-slate-200 focus-visible:ring-emerald-500"
                  value={dialogSearchTerm}
                  onChange={(e) => setDialogSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
              {dialogFilteredCourses.length > 0 ? (
                dialogFilteredCourses.map((c) => {
                  const isSelected = selectedCourseForConfigure === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourseForConfigure(c.id)}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border",
                          isSelected ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm", isSelected ? "text-emerald-900" : "text-slate-700")}>
                            {c.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                            <span className="font-mono bg-violet-100 px-1.5 py-0.5 rounded text-violet-500">{c.courseCode}</span>
                            <span>•</span>
                            <span>{c.lecturerName}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="text-emerald-600 animate-in zoom-in duration-200">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <p className="text-sm">No courses match your search.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
              <Button
                disabled={!selectedCourseForConfigure}
                onClick={() => {
                  if (selectedCourseForConfigure) {
                    setShowConfigureDialog(false);
                    // Navigate to weights config for selected course
                    router.push(`/staff/courses/${selectedCourseForConfigure}/weights`);
                  }
                }}
                className={cn(
                  "transition-all",
                  selectedCourseForConfigure ? "bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                Go to Configuration
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        loading={false}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
