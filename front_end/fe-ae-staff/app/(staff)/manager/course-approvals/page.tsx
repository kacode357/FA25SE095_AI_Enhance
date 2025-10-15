"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/course/useCourses";
import { Course } from "@/types/course/course.response";
import FilterRow from "./components/FilterRow";

export default function CourseApprovalsPage() {
  const router = useRouter();
  const { listData, loading, fetchCourses } = useCourses();

  const [page, setPage] = useState(1);
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);

  // ✅ Filters
  const [name, setName] = useState("");
  const [lecturerName, setLecturerName] = useState("");

  // ✅ Fetch pending courses
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

  return (
    <div className="min-h-full flex flex-col p-3 bg-white text-slate-900">
      {/* ✅ PAGE HEADER */}
      <header className="sticky top-0 z-20 mb-4 bg-white/90 p-3 rounded-md border border-slate-200 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">
          Course Approvals
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review and approve new course requests submitted by lecturers.  
          Only <b>pending</b> courses are shown here.
        </p>
      </header>

      {/* ✅ Main Table */}
      <Card className="flex-1 border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">
            Pending Course Approvals{" "}
            <span className="text-slate-500 text-sm">
              ({listData?.totalCount ?? 0})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <div className="overflow-auto">
            <Table className="w-full text-sm">
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow className="text-slate-600 border-b">
                  <TableHead className="pl-4 font-semibold w-1/3">
                    Course Name
                  </TableHead>
                  <TableHead className="font-semibold w-1/5">
                    Lecturer
                  </TableHead>
                  <TableHead className="text-center font-semibold w-1/6">
                    Term
                  </TableHead>
                  <TableHead className="text-center font-semibold w-1/6">
                    Year
                  </TableHead>
                  <TableHead className="text-center font-semibold w-1/6">
                    Created At
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* ✅ Filter Row */}
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

                {/* ✅ Data Rows */}
                {!loading &&
                  pendingCourses.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() =>
                        router.push(`/manager/course-approvals/${c.id}`)
                      }
                      className="border-b hover:bg-blue-50/50 cursor-pointer"
                    >
                      <TableCell className="pl-4">{c.courseCodeTitle}</TableCell>
                      <TableCell>{c.lecturerName}</TableCell>
                      <TableCell className="text-center">{c.term}</TableCell>
                      <TableCell className="text-center">{c.year}</TableCell>
                      <TableCell className="text-center text-xs">
                        {new Date(c.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                    </motion.tr>
                  ))}

                {!loading && pendingCourses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No pending courses.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
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
      <div className="flex justify-center items-center gap-3 py-3 border-t border-slate-200 mt-3">
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
