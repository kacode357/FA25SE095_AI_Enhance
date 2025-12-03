// app/(staff)/staff/courses/[id]/total-enrollments/page.tsx
"use client";

import PaginationBar from "@/components/common/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseStudents } from "@/hooks/enrollment/useCourseStudents";
import { EnrollmentStatus } from "@/types/enrollments-students/enrollments.response";
import { formatToVN } from "@/utils/datetime/time";
import { Loader2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function TotalEnrollmentsPage() {
    const { id } = useParams();
    const router = useRouter();

    const { students, totalStudents, courseName, loading, fetchCourseStudents } = useCourseStudents(
        typeof id === "string" ? id : ""
    );

    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);

    const fetchedKey = useRef<string | null>(null);

    useEffect(() => {
        const courseId = typeof id === "string" ? id : "";
        if (!courseId) return;

        const key = `${courseId}:${page}:${pageSize}`;
        if (fetchedKey.current !== key) {
            fetchedKey.current = key;
            fetchCourseStudents(courseId);
        }
    }, [id, page, pageSize, fetchCourseStudents]);

    const fmtDate = (v?: string | null) => (v ? formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit" }) : "-");

    const getInitials = (full: string) =>
        full
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() ?? "")
            .join("");

    const totalPages = Math.ceil((totalStudents || 0) / pageSize) || 1;

    const pagedStudents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return students.slice(start, start + pageSize);
    }, [students, page, pageSize]);

    const renderStatusBadge = (status: EnrollmentStatus) => {
        switch (status) {
            case EnrollmentStatus.Active:
                return (
                    <Badge className="bg-green-100 text-green-700 border border-green-200">
                        Active
                    </Badge>
                );
            case EnrollmentStatus.Inactive:
                return (
                    <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
                        Inactive
                    </Badge>
                );
            case EnrollmentStatus.Withdrawn:
                return (
                    <Badge className="bg-red-100 text-red-700 border border-red-200">
                        Withdrawn
                    </Badge>
                );
            case EnrollmentStatus.Suspended:
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Suspended
                    </Badge>
                );
            case EnrollmentStatus.Completed:
                return (
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                        Completed
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
                        Unknown
                    </Badge>
                );
        }
    };

    return (
        <div className="p-5 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                        Students ({totalStudents})
                    </h1>
                    {courseName && (
                        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                            {courseName}
                        </p>
                    )}
                </div>
                <Button
                    onClick={() => router.push(`/staff/courses/${id}`)}
                    className="rounded-xl btn btn-green-slow"
                >
                    ← Back
                </Button>
            </div>

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
                            <div className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                                {totalStudents}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* List students */}
            <Card className="border card gap-0 rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
                        Enrolled Students
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0 gap-0">
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
                            <ul className=""
                                style={{ color: "var(--foreground)" }}
                            >
                                {pagedStudents.map((s) => (
                                    <li
                                        key={s.enrollmentId}
                                        className="flex items-center border-t border-slate-100 justify-between gap-4 p-4"
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
                                                title={s.fullName}
                                            >
                                                {s.profilePictureUrl ? (
                                                    <img
                                                        src={s.profilePictureUrl}
                                                        alt={s.fullName}
                                                        className="w-full h-full object-cover rounded-2xl"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-semibold">{getInitials(s.fullName)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{s.fullName}</div>
                                                <div className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
                                                    Email: {s.email} • Joined: {fmtDate(s.joinedAt)}
                                                </div>
                                            </div>
                                        </div>

                                        <span className="bg-green-50 px-3 py-1 rounded-full text-green-600">{s.status}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Pagination */}
                            <PaginationBar
                                page={page}
                                totalPages={totalPages}
                                totalCount={totalStudents}
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
