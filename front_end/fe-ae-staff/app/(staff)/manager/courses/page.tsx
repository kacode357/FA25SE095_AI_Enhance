"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { Course } from "@/types/course/course.response";
import FilterRow from "./components/FilterRow";

export default function CoursesPage() {
  const router = useRouter();
  const { listData, loading, fetchCourses } = useCourses();
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);

  // ✅ Filters (không có department)
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");

  // ✅ Fetch chỉ lấy Active courses
  const fetchAll = async (pageNum = 1) => {
    await fetchCourses({
      page: pageNum,
      pageSize: 10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      name: name || undefined,
      courseCode: courseCode || undefined,
      lecturerName: lecturerName || undefined,
      status: 2, // Active
    });
  };

  useEffect(() => {
    fetchAll(page);
  }, [page]);

  useEffect(() => {
    if (listData?.courses) setCourses(listData.courses);
  }, [listData]);

  const filtered = useMemo(() => courses, [courses]);
  const totalPages = listData?.totalPages || 1;

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
          Manage and monitor all <b>Active</b> courses.
        </p>
      </header>

      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Active Courses <span className="text-slate-500">({listData?.totalCount ?? 0})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="w-60 text-left font-bold pl-5">Course Name</TableHead>
                  <TableHead className="w-32 text-left font-bold">Code</TableHead>
                  <TableHead className="w-44 text-left font-bold">Lecturer</TableHead>
                  <TableHead className="w-28 text-center font-bold">Enrollments</TableHead>
                  <TableHead className="w-36 text-center font-bold">Created At</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* ✅ Filter Row */}
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

                {/* ✅ Data Rows */}
                {filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => router.push(`/manager/courses/${c.id}`)}
                    className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer"
                  >
                    <TableCell className="text-left pl-5">{c.name}</TableCell>
                    <TableCell className="text-left">{c.courseCode}</TableCell>
                    <TableCell className="text-left">{c.lecturerName}</TableCell>
                    <TableCell className="text-center">{c.enrollmentCount}</TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                  </motion.tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No active courses found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Pagination */}
      <div className="flex justify-center items-center gap-3 py-3 border-t border-slate-200">
        <Button
          className="h-8 px-3 text-xs"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <span className="text-sm text-slate-700">
          Page {page} / {totalPages}
        </span>
        <Button
          className="h-8 px-3 text-xs"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
