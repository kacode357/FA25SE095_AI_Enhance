"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourseRequests } from "@/hooks/course-request/useCourseRequests";
import { cn } from "@/lib/utils";
import { CourseRequest } from "@/types/course-requests/course-requests.response";
import { formatToVN } from "@/utils/datetime/time";
import { motion } from "framer-motion";
import { Check, GraduationCap, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FilterRow from "./components/FilterRow";

export default function CourseRequestsPage() {
  const router = useRouter();
  const { listData, loading, fetchCourseRequests } = useCourseRequests();
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  // --- CONFIG DIALOG STATE (Configure Topic Weight) ---
  const [showConfigureDialog, setShowConfigureDialog] = useState(false);
  const [selectedCourseForConfigure, setSelectedCourseForConfigure] = useState<string | null>(null);
  const [dialogSearchTerm, setDialogSearchTerm] = useState("");

  const dialogFilteredCourses = useMemo(() => {
    if (!dialogSearchTerm) return requests;
    const lowerTerm = dialogSearchTerm.toLowerCase();
    return requests.filter(
      (c) => c.courseCodeTitle.toLowerCase().includes(lowerTerm) || c.courseCode.toLowerCase().includes(lowerTerm) || c.lecturerName.toLowerCase().includes(lowerTerm)
    );
  }, [requests, dialogSearchTerm]);
  const [page, setPage] = useState(1);

  // ✅ Filters
  const [lecturerName, setLecturerName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [status, setStatus] = useState<1 | 2 | 3 | 4 | undefined>(undefined);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [term, setTerm] = useState("");

  const fetchAll = async (pageNum = 1) => {
    await fetchCourseRequests({
      page: pageNum,
      pageSize: 10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      lecturerName: lecturerName || undefined,
      courseCode: courseCode || undefined,
      status,
      department: department || undefined,
      year: year ? Number(year) : undefined,
      term: term || undefined,
    });
  };

  // ✅ Fetch data when page changes
  useEffect(() => {
    fetchAll(page);
  }, [page]);

  // ✅ Update local data
  useEffect(() => {
    if (listData?.courseRequests) setRequests(listData.courseRequests);
  }, [listData]);

  const totalPages = listData?.totalPages || 1;
  const totalCount = listData?.totalCount || 0;

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* ✅ Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <p className="text-slate-600 text-sm pl-3 relative before:content-['•'] before:absolute before:left-0">
          Review and process all course requests from lecturers.
        </p>
      </header>

      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base text-slate-800">
            Course Requests{" "}
            <span className="text-slate-500">({totalCount})</span>
          </CardTitle>
          {/* <Button
            className="shadow-sm bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white transition-all"
            onClick={() => {
              setDialogSearchTerm("");
              setSelectedCourseForConfigure(null);
              setShowConfigureDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Configure Topic Weight
          </Button> */}
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full border-t border-slate-200">
              {/* ✅ Header */}
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-700 border-b border-slate-200">
                  <TableHead className="text-xs pl-5 font-semibold">Lecturer</TableHead>
                  <TableHead className="text-xs font-semibold">Course</TableHead>
                  <TableHead className="text-xs text-center font-semibold">Term</TableHead>
                  <TableHead className="text-xs text-center font-semibold">Status</TableHead>
                  <TableHead className="text-xs text-center font-semibold">Created At</TableHead>
                  <TableHead className="text-xs text-center font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>

              {/* ✅ Body */}
              <TableBody>
                {/* Filter Row */}
                <FilterRow
                  lecturerName={lecturerName}
                  setLecturerName={setLecturerName}
                  courseCode={courseCode}
                  setCourseCode={setCourseCode}
                  status={status}
                  setStatus={setStatus}
                  department={department}
                  setDepartment={setDepartment}
                  year={year}
                  setYear={setYear}
                  term={term}
                  setTerm={setTerm}
                  onApply={() => fetchAll(1)}
                  onClear={() => {
                    setLecturerName("");
                    setCourseCode("");
                    setStatus(undefined);
                    setDepartment("");
                    setYear("");
                    setTerm("");
                    fetchAll(1);
                  }}
                />

                {/* Data Rows */}
                {!loading &&
                  requests.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b text-xs border-slate-100 hover:bg-blue-50/30"
                    >
                      <TableCell className="pl-5">{r.lecturerName}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <div>
                            <Badge variant="outline" className="font-mono text-xs bg-violet-50 text-violet-500">
                              {r.courseCode}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-700 mt-2 font-medium">{r.courseCodeTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{r.term}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={
                            r.status === 1
                              ? "text-yellow-600"
                              : r.status === 2
                                ? "text-green-600"
                                : r.status === 3
                                  ? "text-red-600"
                                  : "text-gray-500"
                          }
                        >
                          {["Pending", "Approved", "Rejected", "Cancelled"][r.status - 1] ||
                            "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs whitespace-nowrap">
                        {formatToVN(r.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="text-xs btn btn-green-slow"
                          onClick={() => router.push(`/staff/course-requests/${r.id}`)}
                        >
                          View Detail
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}

                {/* Empty */}
                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No course requests found.
                    </td>
                  </tr>
                )}

                {/* Loading */}
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

          {/* ✅ Pagination */}
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            loading={loading}
            onPageChange={(newPage) => setPage(newPage)}
          />
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
                <p className="text-sm text-slate-500 mt-0.5">Select a course request to proceed with configuration.</p>
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
                  placeholder="Search by course title, code or lecturer..."
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
                            {c.courseCodeTitle}
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
                  <p className="text-sm">No course requests match your search.</p>
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
                    const selected = requests.find((r) => r.id === selectedCourseForConfigure);
                    if (selected?.createdCourseId) {
                      router.push(`/staff/courses/${selected.createdCourseId}/weights`);
                    } else if (selected?.courseCodeId) {
                      router.push(`/staff/course-codes/${selected.courseCodeId}/weights`);
                    } else {
                      router.push(`/staff/course-requests/${selectedCourseForConfigure}`);
                    }
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
    </div>
  );
}
