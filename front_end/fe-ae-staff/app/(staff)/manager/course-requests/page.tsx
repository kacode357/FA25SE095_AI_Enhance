"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCourseRequests } from "@/hooks/course-request/useCourseRequests";
import { CourseRequest } from "@/types/course-requests/course-requests.response";
import FilterRow from "./components/FilterRow";

export default function CourseRequestsPage() {
  const { listData, loading, fetchCourseRequests } = useCourseRequests();
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

  // ✅ Filter states
  const [lecturerName, setLecturerName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [status, setStatus] = useState<1 | 2 | 3 | 4 | undefined>(undefined);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

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
    });
  };

  useEffect(() => {
    fetchAll(page);
  }, [page]);

  useEffect(() => {
    if (listData?.courseRequests) {
      setRequests(listData.courseRequests);
    }
  }, [listData]);

  const totalPages = listData?.totalPages || 1;

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Filter */}
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
        onApply={() => fetchAll(1)}
        onClear={() => {
          setLecturerName("");
          setCourseCode("");
          setStatus(undefined);
          setDepartment("");
          setYear("");
          fetchAll(1);
        }}
      />

      <Card className="bg-white border border-slate-200 flex-1 flex flex-col mt-2">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Course Requests{" "}
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
                  <TableHead className="w-44 text-left font-bold pl-5">Lecturer</TableHead>
                  <TableHead className="w-32 text-left font-bold">Course Code</TableHead>
                  <TableHead className="w-44 text-left font-bold">Title</TableHead>
                  <TableHead className="w-28 text-center font-bold">Term</TableHead>
                  <TableHead className="w-20 text-center font-bold">Year</TableHead>
                  <TableHead className="w-28 text-center font-bold">Status</TableHead>
                  <TableHead className="w-40 text-center font-bold">Created At</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!loading &&
                  requests.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => router.push(`/manager/course-requests/${r.id}`)} // ✅ click row để xem chi tiết
                      className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer"
                    >
                      <TableCell className="text-left pl-5">{r.lecturerName}</TableCell>
                      <TableCell className="text-left">{r.courseCode}</TableCell>
                      <TableCell className="text-left">{r.courseCodeTitle}</TableCell>
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
                    </motion.tr>
                  ))}

                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No course requests found.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
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
        </CardContent>
      </Card>
    </div>
  );
}
