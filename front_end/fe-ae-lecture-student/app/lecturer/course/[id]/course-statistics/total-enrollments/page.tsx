"use client";

import PaginationBar from "@/components/common/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function TotalEnrollmentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, students: hookStudents, totalStudents, fetchCourseStudents } =
    useCourseStudents(typeof id === "string" ? id : "");

  // Phân trang
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // chỉnh nếu muốn

  // tránh gọi API lặp trong Strict Mode nhưng vẫn refetch khi đổi trang
  const fetchedKey = useRef<string | null>(null);

  useEffect(() => {
    const courseId = typeof id === "string" ? id : "";
    if (!courseId) return;

    const key = `${courseId}:${page}:${pageSize}`;
    if (fetchedKey.current !== key) {
      fetchedKey.current = key;
      // useCourseStudents does not support pagination params — fetch full list for now
      fetchCourseStudents(courseId);
    }
    // no reset() available on useCourseStudents
  }, [id, page, pageSize, fetchCourseStudents]);

  const courseName = data?.courseName ?? "";
  const total = totalStudents ?? hookStudents.length ?? 0;

  const students = useMemo(() => {
    return (hookStudents ?? []).map((s) => ({
      id: s.enrollmentId,
      name: s.fullName,
      status: s.status,
      joinedAt: s.joinedAt,
      unenrolledAt: null,
    }));
  }, [hookStudents]);

  const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleString("en-GB") : "-");

  const getInitials = (full: string) =>
    full
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="h-full flex flex-col">
      {/* Header (fixed) */}
      <div className="flex items-center justify-between -mx-3 px-5 pb-4 pt-2 mb-2 shadow-md flex-none">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Students Enrollment <span className="text-violet-500">({total})</span>
          </h1>
          {courseName && (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {courseName}
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push(`/lecturer/course/${id}/course-statistics`)}
          className="rounded-xl text-sm btn btn-gradient-slow"
        >
          <ArrowLeft className=" size-4" /> Back
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="px-3 py-2 space-y-6 overflow-auto flex-1">
        {/* Summary card */}
        <Card className="border gap-0 card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3" style={{ color: "var(--color-muted)" }}>
              <div
                className="p-2 rounded-2xl border"
                style={{
                  background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                  borderColor: "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                }}
              >
                <Users className="size-5" />
              </div>
              <span className="text-sm">Students</span>
            </div>
            <div className="min-w-[3rem] flex items-center justify-end">
              {loading ? (
                <Loader2 className="size-5 animate-spin opacity-70" />
              ) : (
                <div className="text-3xl font-bold text-violet-500">{total}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* List students */}
        <Card className="border card rounded-2xl overflow-hidden">
          <CardHeader className="gap-0">
            <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
              Enrolled Students
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
                <Loader2 className="size-4 animate-spin" /> Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
                No students enrolled.
              </div>
            ) : (
              <>
                <ul
                  className="divide-y"
                  style={{ ['--tw-divide-color' as any]: 'color-mix(in oklab, var(--color-border) 10%, transparent)' }}
                >
                  {students.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-4 border-slate-100 p-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      <div className="flex items-center border-slate-50 gap-3 min-w-0">
                        <div
                          className="size-10 grid place-items-center border-slate-50 rounded-full border shrink-0"
                          style={{
                            background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                            borderColor:
                              "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                          }}
                          title={s.name}
                        >
                          <span className="text-xs font-semibold">{getInitials(s.name)}</span>
                        </div>
                        <div className="min-w-0 border-slate-50">
                          <div className="font-medium truncate">{s.name}</div>
                          <div className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
                            Joined: {fmtDate(s.joinedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {s.status === 1 ? (
                          <Badge className="bg-green-100 text-green-700 border border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
                            Unenrolled
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  totalCount={total}
                  loading={loading}
                  onPageChange={(p) => setPage(p)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}