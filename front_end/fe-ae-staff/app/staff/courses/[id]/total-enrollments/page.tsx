// app/(staff)/staff//courses/[id]/total-enrollments/page.tsx
"use client";

import PaginationBar from "@/components/common/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseEnrollments } from "@/hooks/course/useCourseEnrollments";
import { Loader2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function TotalEnrollmentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchEnrollments, reset } = useCourseEnrollments();

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
      fetchEnrollments(courseId, { page, pageSize, sortDirection: "desc" });
    }
    return () => reset();
  }, [id, page, pageSize, fetchEnrollments, reset]);

  const courseName = data?.course?.name ?? "";
  const total = data?.totalCount ?? data?.course?.enrollmentCount ?? 0;

  const students = useMemo(() => {
    return (data?.enrollments ?? []).map((e) => ({
      id: e.id,
      name: e.studentName,
      status: e.status, // 1 active, else unenrolled
      joinedAt: e.joinedAt,
      unenrolledAt: e.unenrolledAt,
    }));
  }, [data?.enrollments]);

  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString("en-GB") : "-";

  const getInitials = (full: string) =>
    full
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");

  const totalPages = (data?.totalPages ?? Math.ceil((total || 0) / pageSize)) || 1;

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Students ({total})
          </h1>
          {courseName && (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {courseName}
            </p>
          )}
        </div>
        <Button onClick={() => router.push(`/staff/courses/${id}`)} className="rounded-xl btn btn-gradient-slow">
          ← Back
        </Button>
      </div>

      {/* Summary card */}
      <Card className="border card rounded-2xl">
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
              <div className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                {total}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List students */}
      <Card className="border card rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
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
              <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {students.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 p-4"
                    style={{ color: "var(--foreground)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="size-9 grid place-items-center rounded-2xl border shrink-0"
                        style={{
                          background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                          borderColor:
                            "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                        }}
                        title={s.name}
                      >
                        <span className="text-xs font-semibold">{getInitials(s.name)}</span>
                      </div>
                      <div className="min-w-0">
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
  );
}
