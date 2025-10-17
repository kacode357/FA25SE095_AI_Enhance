"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCourseRequests } from "@/hooks/course-request/useCourseRequests";
import { CourseRequest } from "@/types/course-requests/course-requests.response";
import FilterRow from "./components/FilterRow";
import PaginationBar from "../../../../components/common/PaginationBar";

export default function CourseRequestsPage() {
  const router = useRouter();
  const { listData, loading, fetchCourseRequests } = useCourseRequests();
  const [requests, setRequests] = useState<CourseRequest[]>([]);
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
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Course Requests{" "}
            <span className="text-slate-500">({totalCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full border-t border-slate-200">
              {/* ✅ Header */}
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-700 border-b border-slate-200">
                  <TableHead className="pl-5 font-semibold">Lecturer</TableHead>
                  <TableHead className="font-semibold">Course Code</TableHead>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="text-center font-semibold">Term</TableHead>
                  <TableHead className="text-center font-semibold">Year</TableHead>
                  <TableHead className="text-center font-semibold">Status</TableHead>
                  <TableHead className="text-center font-semibold">Created At</TableHead>
                  <TableHead className="text-center font-semibold">Action</TableHead>
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
                      className="border-b border-slate-100 hover:bg-blue-50/30"
                    >
                      <TableCell className="pl-5">{r.lecturerName}</TableCell>
                      <TableCell>{r.courseCode}</TableCell>
                      <TableCell>{r.courseCodeTitle}</TableCell>
                      <TableCell className="text-center">{r.term}</TableCell>
                      <TableCell className="text-center">{r.year}</TableCell>
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
                        {new Date(r.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => router.push(`/manager/course-requests/${r.id}`)}
                        >
                          View Detail
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}

                {/* Empty */}
                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No course requests found.
                    </td>
                  </tr>
                )}

                {/* Loading */}
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
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
    </div>
  );
}
