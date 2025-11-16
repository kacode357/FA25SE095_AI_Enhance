"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpenCheck, ChevronRight, Loader2 } from "lucide-react";
import LateSubmissions from "./late-submitssion/LateSubmissions";

import { useAssignments } from "@/hooks/assignment/useAssignments";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useGetLateSubmissions } from "@/hooks/reports/useGetLateSubmissions";
import { useGetReportByCourse } from "@/hooks/reports/useGetReportByCourse";
import type { CourseItem } from "@/types/courses/course.response";
import type { CourseReportItem } from "@/types/reports/reports.response";

export default function LecturerCourseReportsPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const courseIdParam = sp.get("courseId") || "";

    const { listData: courses, fetchMyCourses, loading: loadingCourses } = useMyCourses();
    const { getReportByCourse, loading: loadingReports } = useGetReportByCourse();
    const { getLateSubmissions, loading: loadingLate } = useGetLateSubmissions();
    const { listData: assignmentsData, loading: loadingAssignments, fetchAssignments } = useAssignments();
    const { students: enrolledStudents, fetchCourseStudents } = useCourseStudents("");

    const [courseId, setCourseId] = useState<string>(courseIdParam);
    const [items, setItems] = useState<CourseReportItem[]>([]);
    const [lateItems, setLateItems] = useState<any[]>([]);
    const [assignmentId, setAssignmentId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"byCourse" | "late">("byCourse");
    const [error, setError] = useState<string | null>(null);

    // Load lecturer's courses once
    useEffect(() => {
        fetchMyCourses({ asLecturer: true, page: 1, pageSize: 100 });
    }, [fetchMyCourses]);

    // If no courseId in URL, fallback to first course when ready
    useEffect(() => {
        if (!courseId && courses.length > 0) {
            const first = courses[0];
            handleCourseChange(first.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses]);

    const selectedCourse: CourseItem | undefined = useMemo(
        () => courses.find((c) => c.id === courseId),
        [courses, courseId]
    );

    const fetchData = async (cid: string) => {
        if (!cid) return;
        setError(null);
        try {
            const res = await getReportByCourse({ courseId: cid, pageNumber: 1, pageSize: 200 });
            setItems(res?.reports || []);
        } catch (e: any) {
            setError(e?.message || "Failed to load course reports");
        }
    };

    const fetchLateData = async (cid?: string, aid?: string) => {
        setError(null);
        try {
            const res = await getLateSubmissions({ courseId: cid || undefined, assignmentId: aid || undefined, pageNumber: 1, pageSize: 500 });
            setLateItems(res?.reports || []);
        } catch (e: any) {
            setError(e?.message || "Failed to load late submissions");
        }
    };

    const handleCourseChange = (cid: string) => {
        setCourseId(cid);
        const qs = new URLSearchParams(sp?.toString());
        qs.set("courseId", cid);
        router.replace(`/lecturer/course/reports?${qs.toString()}`);
        fetchData(cid);
        // preload students for nicer display of submitted-by names
        fetchCourseStudents(cid);
    };

    const handleCourseChangeForLate = (cid: string) => {
        // keep same behavior for URL
        setCourseId(cid);
        const qs = new URLSearchParams(sp?.toString());
        qs.set("courseId", cid);
        router.replace(`/lecturer/course/reports?${qs.toString()}`);
        // fetch assignments for selector and late items
        fetchAssignments({ courseId: cid, pageNumber: 1, pageSize: 200 });
        fetchLateData(cid, assignmentId || undefined);
        fetchCourseStudents(cid);
    };

    // Keep in sync when URL already had a courseId
    useEffect(() => {
        if (courseIdParam && courseIdParam !== courseId) {
            setCourseId(courseIdParam);
            fetchData(courseIdParam);
            fetchCourseStudents(courseIdParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseIdParam]);

    return (
        <div className="p-3 sm:p-3 lg:p-4 h-full">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-[12px] flex justify-between select-none overflow-hidden mb-4">
                <div className="flex items-center justify-between">
                    <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                        <li className="flex flex-row gap-0 items-center">
                            <BookOpenCheck className="size-4" />
                            <span className="px-1 py-0.5 rounded">Reports</span>
                        </li>
                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                        <li className="max-w-[220px] truncate font-medium text-slate-900">
                            {selectedCourse ? `${selectedCourse.courseCode} — ${selectedCourse.name}` : "Select a course"}
                        </li>
                    </ol>
                </div>
                <div>
                    <Button
                        className="text-sm btn btn-gradient-slow"
                        onClick={() => {
                            const qs = new URLSearchParams();
                            if (courseId) qs.set("courseId", courseId);
                            router.push(`/lecturer/course/reports/requiring-grading${qs.toString() ? `?${qs.toString()}` : ""}`);
                        }}
                    >
                        Requiring Grading
                    </Button>
                </div>
            </nav>

            <Card className="shadow-md py-0 border-slate-200 h-[calc(100%_-_0px)] max-h-full overflow-hidden flex flex-col">
                <CardHeader className="flex items-center justify-between p-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Manage Reports</h2>
                        <div className="text-sm text-slate-600 mt-1">View and filter reports by course</div>
                        {/* Tabs */}
                        <div className="inline-flex rounded-md bg-slate-100 p-1 mt-5">
                            <button
                                className={`px-3 py-1 text-sm rounded ${activeTab === "byCourse" ? "bg-white shadow-sm" : "text-slate-600"}`}
                                onClick={() => setActiveTab("byCourse")}
                            >
                                By Course
                            </button>
                            <button
                                className={`px-3 py-1 text-sm rounded ${activeTab === "late" ? "bg-white shadow-sm" : "text-slate-600"}`}
                                onClick={() => {
                                    setActiveTab("late");
                                    // when switching to late tab, fetch late data and assignments
                                    if (courseId) {
                                        fetchAssignments({ courseId, pageNumber: 1, pageSize: 200 });
                                        fetchLateData(courseId, assignmentId || undefined);
                                    }
                                }}
                            >
                                Late Submissions
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={courseId}
                            onChange={(e) => (activeTab === "late" ? handleCourseChangeForLate(e.target.value) : handleCourseChange(e.target.value))}
                            className="min-w-[220px] rounded border border-slate-300 px-2 py-1 text-sm"
                            aria-label="Select course"
                        >
                            <option value="" disabled>
                                {loadingCourses ? "Loading courses..." : "Select a course"}
                            </option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.courseCode} — {c.name}
                                </option>
                            ))}
                        </select>

                        {/* assignment selector shown in late tab */}
                        <select
                            title="Assignment"
                            value={assignmentId}
                            onChange={(e) => {
                                setAssignmentId(e.target.value);
                                if (courseId) fetchLateData(courseId, e.target.value || undefined);
                            }}
                            className="min-w-[220px] rounded border border-slate-300 px-2 py-1 text-sm"
                            disabled={!courseId || loadingAssignments || activeTab !== "late"}
                        >
                            <option value="" disabled={!!loadingAssignments}>
                                {loadingAssignments ? "Loading assignments..." : "All assignments (optional)"}
                            </option>
                            {(assignmentsData?.assignments ?? []).map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.title}
                                </option>
                            ))}
                        </select>

                        <Button size="sm" variant="outline" onClick={() => activeTab === "late" ? fetchLateData(courseId || undefined, assignmentId || undefined) : (courseId && fetchData(courseId))} disabled={!courseId}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 min-h-0">
                    <Separator />

                    {/* List */}
                    {!courseId && (
                        <div className="p-6 text-slate-600">Please select a course to view reports.</div>
                    )}

                    {courseId && activeTab === "byCourse" && (
                        loadingReports ? (
                            <div className="flex items-center justify-center p-8 text-slate-600">
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading reports...
                            </div>
                        ) : error ? (
                            <div className="p-6 text-red-600">{error}</div>
                        ) : items.length === 0 ? (
                            <div className="p-6 text-slate-600">No reports found for this course.</div>
                        ) : (
                            <div className="overflow-auto max-h-[calc(100vh-220px)]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
                                        <tr>
                                            <th className="text-left font-medium px-4 py-2">Assignment</th>
                                            <th className="text-left font-medium px-4 py-2">Group / By</th>
                                            <th className="text-left font-medium px-4 py-2">Submitted</th>
                                            <th className="text-left font-medium px-4 py-2">Status</th>
                                            <th className="text-left font-medium px-4 py-2">Grade</th>
                                            <th className="text-left font-medium px-4 py-2">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((r) => (
                                            <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                                                <td className="px-4 py-2">
                                                    <div className="font-medium text-slate-900 truncate max-w-[300px]">{r.assignmentTitle || r.assignmentId}</div>
                                                    <div className="text-xs text-slate-500">#{r.id.slice(0, 8)}</div>
                                                </td>
                                                        <td className="px-4 py-2">
                                                            {(() => {
                                                                // Prefer group name, then map submittedBy (studentId) to enrolled student fullName when available
                                                                const studentName = enrolledStudents?.find((e) => e.studentId === r.submittedBy)?.fullName || enrolledStudents?.find((e) => e.studentId === r.submittedBy)?.firstName && enrolledStudents?.find((e) => e.studentId === r.submittedBy)?.lastName ? `${enrolledStudents?.find((e) => e.studentId === r.submittedBy)?.firstName} ${enrolledStudents?.find((e) => e.studentId === r.submittedBy)?.lastName}` : undefined;
                                                                const display = r.groupName || studentName || r.submittedBy || "—";
                                                                return (
                                                                    <>
                                                                        <div className="text-slate-800">{display}</div>
                                                                        {r.groupId && <div className="text-xs text-slate-500">Group: {r.groupId}</div>}
                                                                    </>
                                                                );
                                                            })()}
                                                        </td>
                                                <td className="px-4 py-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</td>
                                                <td className="px-4 py-2">{String(r.status)}</td>
                                                <td className="px-4 py-2">{r.grade ?? "—"}</td>
                                                <td className="px-4 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {courseId && activeTab === "late" && (
                        <LateSubmissions items={lateItems} loading={loadingLate} error={error} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
