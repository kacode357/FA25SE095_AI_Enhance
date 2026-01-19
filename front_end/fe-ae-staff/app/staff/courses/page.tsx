"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { Course } from "@/types/course/course.response";
import { formatToVN } from "@/utils/datetime/time";
import { motion } from "framer-motion";
import { LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FilterRow from "./components/FilterRow";

export default function CoursesPage() {
  const router = useRouter();
  const { listData, loading, fetchCourses } = useCourses();

  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);

  // Filters
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");

  const pageSize = 10;

  // Fetch Active courses
  const fetchAll = async (pageNum = 1) => {
    await fetchCourses({
      page: pageNum,
      pageSize,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      name: name || undefined,
      courseCode: courseCode || undefined,
      lecturerName: lecturerName || undefined,
      status: 2, // Active
    });
    setPage(pageNum);
  };

  useEffect(() => {
    fetchAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (listData?.courses) setCourses(listData.courses);
  }, [listData]);

  const filtered = useMemo(() => courses, [courses]);

  const totalPages =
    listData?.totalPages ??
    Math.max(1, Math.ceil((listData?.totalCount ?? 0) / pageSize));

  // --- CONFIG DIALOG STATE ---
  const [showConfigureDialog, setShowConfigureDialog] = useState(false);
  const [selectedCourseForConfigure, setSelectedCourseForConfigure] = useState<string | null>(null);
  const [dialogSearchTerm, setDialogSearchTerm] = useState("");

  // Filter list inside the modal based on search term (Client side for better UX)
  const dialogFilteredCourses = useMemo(() => {
    if (!dialogSearchTerm) return filtered;
    const lowerTerm = dialogSearchTerm.toLowerCase();
    return filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerTerm) ||
        c.courseCode.toLowerCase().includes(lowerTerm)
    );
  }, [filtered, dialogSearchTerm]);

  return (
    <div className="min-h-full flex flex-col p-4 md:p-6 bg-slate-50/50 text-slate-900 space-y-4">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-emerald-600" />
            Course Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor and manage all active courses in the system.
          </p>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="border-none shadow-sm bg-white ring-1 ring-slate-200 flex-1 flex flex-col">
        <CardHeader className="">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
              <span>Active Courses List</span>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
                {listData?.totalCount ?? 0} total
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow className="border-b border-slate-200 hover:bg-slate-50">
                  <TableHead className="w-[30%] pl-6 font-semibold text-slate-700">Course Name</TableHead>
                  <TableHead className="w-[15%] font-semibold text-slate-700">Code</TableHead>
                  <TableHead className="w-[20%] font-semibold text-slate-700">Lecturer</TableHead>
                  <TableHead className="w-[10%] text-center font-semibold text-slate-700">Enrollments</TableHead>
                  <TableHead className="w-[15%] text-center font-semibold text-slate-700">Created At</TableHead>
                  <TableHead className="w-[10%] text-center font-semibold text-slate-700">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Filter Row */}
                <FilterRow
                  name={name}
                  setName={setName}
                  courseCode={courseCode}
                  setCourseCode={setCourseCode}
                  lecturerName={lecturerName}
                  setLecturerName={setLecturerName}
                  onApply={() => fetchAll(1)}
                  onClear={() => {
                    setName("");
                    setCourseCode("");
                    setLecturerName("");
                    fetchAll(1);
                  }}
                />

                {/* Data Rows */}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                        Loading courses...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      No active courses found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                    >
                      <TableCell className="pl-6 py-5 font-medium text-sm text-slate-800">
                        {c.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs bg-violet-50 text-violet-500">
                          {c.courseCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 text-slate-600 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {c.lecturerName.charAt(0)}
                        </div>
                        {c.lecturerName}
                      </TableCell>
                      <TableCell className="text-center text-slate-600">
                        {c.enrollmentCount}
                      </TableCell>
                      <TableCell className="text-center text-slate-500 text-xs">
                        {formatToVN(c.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-600 btn btn-green-slow cursor-pointer hover:text-emerald-700 hover:bg-emerald-50 h-8"
                          onClick={() => router.push(`/staff/courses/${c.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border-t border-slate-100 p-4 bg-white">
            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalCount={listData?.totalCount ?? 0}
              loading={loading}
              onPageChange={(p) => {
                if (p !== page) fetchAll(p);
              }}
            />
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
}