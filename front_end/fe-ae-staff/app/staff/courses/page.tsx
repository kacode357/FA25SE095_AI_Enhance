"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { Course } from "@/types/course/course.response";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

  const pageSize = 10;

  // ✅ Fetch chỉ lấy Active courses
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
            Active Courses{" "}
            <span className="text-slate-500">
              ({listData?.totalCount ?? 0})
            </span>
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
                  {/* ➕ Action column */}
                  <TableHead className="w-28 text-center font-bold">Action</TableHead>
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
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <TableCell className="text-left pl-5">{c.name}</TableCell>
                    <TableCell className="text-left">{c.courseCode}</TableCell>
                    <TableCell className="text-left">{c.lecturerName}</TableCell>
                    <TableCell className="text-center">{c.enrollmentCount}</TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="h-8 px-3 btn btn-green-slow text-xs"
                        variant="outline"
                        aria-label={`View details for ${c.name}`}
                        onClick={() => router.push(`/staff/courses/${c.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No active courses found.
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

        {/* ✅ Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={listData?.totalCount ?? 0}
          loading={loading}
          onPageChange={(p) => {
            if (p !== page) fetchAll(p);
          }}
        />
      </Card>
    </div>
  );
}
