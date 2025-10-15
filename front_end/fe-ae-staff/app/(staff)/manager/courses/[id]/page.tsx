"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourseEnrollments } from "@/hooks/course/useCourseEnrollments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchEnrollments } = useCourseEnrollments();

  useEffect(() => {
    if (id && typeof id === "string") fetchEnrollments(id);
  }, [id]);

  const enrollments = data?.enrollments ?? [];
  const course = data?.course;
  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString("en-GB") : "-";

  if (loading)
    return (
      <div className="p-6 text-center text-slate-500">Loading enrollments...</div>
    );

  if (!course)
    return (
      <div className="p-6 text-center text-slate-500">
        Course not found.
        <div className="mt-4">
          <Button onClick={() => router.push("/manager/courses")}>Back</Button>
        </div>
      </div>
    );

  return (
    <div className="p-5 space-y-5">
      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {course.courseCode} — {course.courseCodeTitle}
          </h1>
          <p className="text-sm text-slate-500">
            Lecturer: <b>{course.lecturerName}</b> •{" "}
            {course.enrollmentCount} students
          </p>
        </div>
        <Button
    
         
          onClick={() => router.push("/manager/courses")}
        >
          ← Back
        </Button>
      </div>

      {/* ✅ Bảng Enrollments */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">
            Student Enrollments
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-md border border-slate-100">
            <Table className="table-auto w-full text-sm">
              <TableHeader>
                <TableRow className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <TableHead className="text-left font-semibold py-3 pl-4 w-1/3">
                    Student Name
                  </TableHead>
                  <TableHead className="text-center font-semibold w-1/6">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold w-1/4">
                    Joined At
                  </TableHead>
                  <TableHead className="text-center font-semibold w-1/4 pr-4">
                    Unenrolled At
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {enrollments.length > 0 ? (
                  enrollments.map((e) => (
                    <TableRow
                      key={e.id}
                      className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <TableCell className="pl-4 text-slate-800 font-medium">
                        {e.studentName}
                      </TableCell>

                      <TableCell className="text-center">
                        {e.status === 1 ? (
                          <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs px-2">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border border-gray-200 text-xs px-2">
                            Unenrolled
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center text-xs text-slate-700 whitespace-nowrap">
                        {fmtDate(e.joinedAt)}
                      </TableCell>

                      <TableCell className="text-center text-xs text-slate-700 whitespace-nowrap">
                        {fmtDate(e.unenrolledAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      No students enrolled in this course.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
