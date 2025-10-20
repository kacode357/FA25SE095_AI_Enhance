"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { Course } from "@/types/course/course.response";
import FilterRow from "./components/FilterRow";
import PaginationBar from "../../../../components/common/PaginationBar";
import { Button } from "@/components/ui/button";

export default function CourseApprovalsPage() {
  const router = useRouter();
  const { listData, loading, fetchCourses } = useCourses();

  const [page, setPage] = useState(1);
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);

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
        <p className="text-sm text-slate-600 mt-1">
          Review and approve new course requests submitted by lecturers. Only <b>pending</b> courses are shown here.
        </p>
      </header>

      {/* Table card */}
      <Card className="flex-1 border border-slate-200">
        <CardHeader>
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
                  <TableHead className="pl-4 font-bold w-1/4 text-left">Course Name</TableHead>
                  <TableHead className="font-bold w-1/5 text-left">Lecturer</TableHead>
                  <TableHead className="font-bold w-1/6 text-center">Term</TableHead>
                  <TableHead className="font-bold w-1/6 text-center">Year</TableHead>
                  <TableHead className="font-bold w-1/6 text-center">Created At</TableHead>
                  <TableHead className="font-bold w-[120px] text-center">Action</TableHead>
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
                {!loading &&
                  pendingCourses.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-100 hover:bg-blue-50/40"
                    >
                      <TableCell className="pl-4 text-left">{c.courseCodeTitle}</TableCell>
                      <TableCell className="text-left">{c.lecturerName}</TableCell>
                      <TableCell className="text-center">{c.term}</TableCell>
                      <TableCell className="text-center">{c.year}</TableCell>
                      <TableCell className="text-center text-xs whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => router.push(`/staff/manager/course-approvals/${c.id}`)}
                        >
                          View Detail
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}

                {!loading && pendingCourses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No pending courses.
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

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
