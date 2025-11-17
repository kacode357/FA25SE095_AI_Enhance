"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowBigRightDash, BookOpenCheck, ChevronRight, FileText, Loader2 } from "lucide-react";
import LateSubmissions from "./late-submitssion/LateSubmissions";

import { useAssignments } from "@/hooks/assignment/useAssignments";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useGetLateSubmissions } from "@/hooks/reports/useGetLateSubmissions";
import { useGetReportByCourse } from "@/hooks/reports/useGetReportByCourse";
import { AssignmentService } from "@/services/assignment.services";
import type { CourseItem } from "@/types/courses/course.response";
import type { CourseReportItem } from "@/types/reports/reports.response";
import { formatDistanceToNow, parseISO } from "date-fns";
import StatusBadge from "../[id]/reports/utils/status";

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
            const reports = res?.reports || [];
            const missingTitle = reports.some((r) => !r.assignmentTitle && r.assignmentId);
            if (missingTitle) {
                try {
                    const asgRes = await AssignmentService.list({ courseId: cid, pageNumber: 1, pageSize: 200 });
                    const map = new Map<string, string>();
                    (asgRes?.assignments || []).forEach((a: any) => map.set(a.id, a.title));
                    const mapped = reports.map((r: any) => ({ ...r, assignmentTitle: r.assignmentTitle || map.get(r.assignmentId) }));
                    setItems(mapped);
                } catch (e) {
                    setItems(reports);
                }
            } else {
                setItems(reports);
            }
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

    const getStudentName = (id?: string | null) => {
        if (!id) return "—";
        const s = enrolledStudents?.find((e) => e.studentId === id || e.email === id);
        if (!s) return id;
        return (s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()) || id;
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

    useEffect(() => {
        if (!courseId) return;
        if (activeTab === "late") {
            // fetch assignments for selector
            fetchAssignments({ courseId, pageNumber: 1, pageSize: 200 });
            fetchLateData(courseId, assignmentId || undefined);
            fetchCourseStudents(courseId);
        } else {
            fetchData(courseId);
        }
    }, [courseId, activeTab]);

    useEffect(() => {
        if (!courseId || items.length === 0) return;
        const missing = items.some((r) => {
            if (!r.submittedBy) return false;
            const found = enrolledStudents?.find((e) => e.studentId === r.submittedBy || e.email === r.submittedBy);
            return !found;
        });
        if (missing) {
            fetchCourseStudents(courseId).catch(() => {});
        }
    }, [items, enrolledStudents, courseId, fetchCourseStudents]);

    return (
        <div className="p-3 sm:p-3 lg:p-4 flex flex-1 flex-col h-screen overflow-hidden">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-[12px] flex justify-between select-none overflow-hidden pb-2">
                <div className="flex items-center justify-between">
                    <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                        <li className="flex flex-row gap-0 cursor-text items-center">
                            <BookOpenCheck className="size-4" />
                            <span className="px-1 py-0.5 rounded">Reports</span>
                        </li>
                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                        <li className="max-w-[220px] truncate font-medium cursor-text text-slate-900">
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

            <Card className="flex-1 flex flex-col py-0 gap-0 border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Manage Reports</h2>
                        <div className="text-sm text-slate-600 mt-1">View and filter reports by course</div>
                        {/* Tabs */}
                        <div className="inline-flex rounded-md bg-slate-100 p-1 mt-5">
                            <button
                                className={`px-3 py-1 text-sm rounded cursor-pointer ${activeTab === "byCourse" ? "bg-white shadow-sm" : "text-slate-600"}`}
                                onClick={() => setActiveTab("byCourse")}
                            >
                                By Course
                            </button>
                            <button
                                className={`px-3 py-1 text-sm rounded cursor-pointer ${activeTab === "late" ? "bg-white shadow-sm" : "text-slate-600"}`}
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

                        {/* assignment selector shown only in Late tab */}
                        {activeTab === "late" && (
                            <select
                                title="Assignment"
                                value={assignmentId}
                                onChange={(e) => {
                                    setAssignmentId(e.target.value);
                                    if (courseId) fetchLateData(courseId, e.target.value || undefined);
                                }}
                                className="min-w-[220px] rounded border border-slate-300 px-2 py-1 text-sm"
                                disabled={!courseId || loadingAssignments}
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
                        )}

                        <Button size="sm" variant="outline" onClick={() => activeTab === "late" ? fetchLateData(courseId || undefined, assignmentId || undefined) : (courseId && fetchData(courseId))} disabled={!courseId}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 min-h-0 overflow-auto">
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
                            <div className="overflow-auto p-3 flex-1 min-h-0">
                                <ul className="space-y-5">
                                    {items.map((r) => (
                                        <li key={r.id} className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr,320px] gap-4 items-start">
                                                <div className="min-w-0">
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-7 h-7 text-indigo-600 mt-1" />
                                                        <div className="truncate w-full">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-slate-900 text-lg truncate">
                                                                        {r.groupName ?? getStudentName(r.submittedBy) ?? `Report ${r.id.slice(0, 8)}`}
                                                                    </div>
                                                                    <div className="text-sm text-slate-600 mt-1 truncate">Assignment: {r.assignmentTitle ?? `Assignment ${r.assignmentId}`}</div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                                                                <div>
                                                                    <div className="text-xs mb-2 text-slate-500">Submitted At</div>
                                                                    <div className="font-normal">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}</div>
                                                                    {r.submittedAt && (
                                                                        <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(r.submittedAt), { addSuffix: true })}</div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-2">Created</div>
                                                                    <div className="font-normal">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</div>
                                                                </div>

                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-2">Updated</div>
                                                                    <div className="font-normal">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}</div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 sm:items-center sm:justify-between gap-3">
                                                                <div className="text-sm text-slate-700">
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-xs text-slate-500">Group</span>
                                                                        <span className="font-medium">{r.groupName ?? '-'}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-sm text-slate-700">
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-xs text-slate-500">Submitted by</span>
                                                                        <span className="font-medium">{getStudentName(r.submittedBy)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-sm text-slate-700">
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-xs text-slate-500">File URL</span>
                                                                        <div className="text-xs font-mono">
                                                                            {r.fileUrl ? (
                                                                                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{r.fileUrl}</a>
                                                                            ) : ('-')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-2 mt-3">
                                                                {r.fileUrl && (
                                                                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded">Download</a>
                                                                )}

                                                                <Button size="sm" className="shadow-md mb-2 mr-1 text-violet-800 bg-violet-50" onClick={() => router.push(`/lecturer/course/reports/${r.id}${courseId ? `?courseId=${courseId}` : ''}`)}>
                                                                    View<ArrowBigRightDash className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <div className="bg-slate-50 flex border justify-around border-slate-100 rounded-xl p-4 shadow-sm flex-row items-center text-center gap-3">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-xs text-slate-500">Group submission</div>
                                                            <div className="font-medium">{r.isGroupSubmission ? 'Yes' : 'No'}</div>
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-xs text-slate-500">Status</div>
                                                            <div className=""><StatusBadge status={r.status} /></div>
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-xs text-slate-500">Version</div>
                                                            <div className="font-medium">{r.version}</div>
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-xs text-slate-500">Grade</div>
                                                            <div className="font-semibold text-slate-900">{r.grade ?? <span className="italic text-slate-400 font-normal text-sm">Not updated yet</span>}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
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
