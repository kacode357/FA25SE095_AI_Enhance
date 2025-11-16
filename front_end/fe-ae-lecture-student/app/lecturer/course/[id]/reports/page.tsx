"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { Book, ChevronRight, FileDown, FileText, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useAssignmentReports } from "@/hooks/reports/useAssignmentReports";
import { useExportAssignmentGrades } from "@/hooks/reports/useExportAssignmentGrades";
import { useGetReportById } from "@/hooks/reports/useGetReportById";
import type { ReportBase } from "@/types/reports/reports.response";
import { formatDistanceToNow, parseISO } from "date-fns";
import StatusBadge from "./utils/status";

export default function LecturerAssignmentReportsPage() {
    const params = useParams();
    const sp = useSearchParams();
    const courseId = typeof params?.id === "string" ? params.id : "";
    const assignmentId = sp.get("assignmentId") || "";

    const { fetchAssignmentReports, loading: loadingList } = useAssignmentReports();
    const { getReportById, loading: loadingDetail } = useGetReportById();
    const { data: course, fetchCourseById } = useGetCourseById();
    const { students: enrolledStudents, fetchCourseStudents } = useCourseStudents("");
    const { exportGrades, loading: exporting } = useExportAssignmentGrades();

    const [items, setItems] = useState<ReportBase[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!assignmentId) return;
            try {
                const res = await fetchAssignmentReports({ assignmentId, pageNumber: 1, pageSize: 200 });
                if (res?.reports) setItems(res.reports as ReportBase[]);
            } catch (e: any) {
                setError(e?.message || "Failed to load reports");
            }
        })();
    }, [assignmentId]);
    useEffect(() => {
        if (courseId) fetchCourseById(courseId);
        if (courseId) fetchCourseStudents(courseId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const getStudentName = (id?: string | null) => {
        if (!id) return "—";
        const s = enrolledStudents?.find((e) => e.studentId === id);
        if (!s) return id;
        return (s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()) || id;
    };

    const assignmentTitle = useMemo(() => {
        return items?.[0]?.assignmentTitle ?? `Assignment ${assignmentId}`;
    }, [items, assignmentId]);

    const openDetail = async (id: string) => {
        setSelectedReport(id);
        const res = await getReportById(id);
        if (res?.report) setSelectedDetail(res.report);
    };

    const closeDetail = () => {
        setSelectedReport(null);
        setSelectedDetail(null);
    };

    const router = useRouter();

    return (
        <div className="py-1.5 px-2 sm:px-2 lg:px-3 min-h-screen overflow-auto">
            {/* Breadcrumb (follow CourseDetailPage style) */}
            <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mb-4">
                <div className="flex items-center justify-between">
                    <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                        <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
                            <Book className="size-4" />
                            <button
                                onClick={() => router.push('/lecturer/course')}
                                className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
                            >
                                Courses Management
                            </button>
                        </li>

                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />

                        <li className="text-slate-500 max-w-[220px] truncate">
                            <button
                                onClick={() => router.push(courseId ? `/lecturer/course/${courseId}` : '/lecturer/course')}
                                className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[220px] truncate text-left"
                                title={course?.courseCodeTitle ?? `Course ${courseId}`}
                            >
                                {course?.courseCode ? `${course.courseCode} — ${course.courseCodeTitle}` : `Course ${courseId}`}
                            </button>
                        </li>

                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />

                        <li className="font-medium cursor-text text-slate-900 max-w-[150px] truncate">Report Details</li>
                    </ol>
                </div>
            </nav>

            <Card className="shadow-md py-0 gap-0 border-slate-200 max-h-[calc(100vh-160px)] overflow-y-auto">
                <CardHeader className="flex flex-row items-start justify-between p-4">
                    <div>
                        <div className="flex gap-1 items-end">
                            <h2 className="text-lg font-normal text-slate-600">Reports for - </h2>
                            <div className="text-xl text-slate-900 mt-1">{assignmentTitle}</div>
                        </div>
                        <div className="text-sm text-slate-500">{items.length} report(s)</div>
                    </div>
                    <Button
                        className="bg-green-100 shadow-lg text-sm text-green-900"
                        onClick={() => exportGrades(assignmentId)}
                        disabled={!assignmentId || exporting}
                    >
                        {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="size-4" />}
                        Export Grade
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    <Separator />

                    {loadingList && (
                        <div className="flex items-center justify-center p-8 text-slate-600">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading reports...
                        </div>
                    )}

                    {!loadingList && error && (
                        <div className="p-6 text-red-600">{error}</div>
                    )}

                    {!loadingList && !error && items.length === 0 && (
                        <div className="p-6 text-slate-600">No reports were submitted yet for this assignment.</div>
                    )}

                    {!loadingList && items.length > 0 && (
                        <ul className="divide-y">
                            {items.map((r) => (
                                <li key={r.id} className="p-4 hover:bg-slate-50">
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,320px] gap-4 items-start">
                                        {/* Left: main content */}
                                        <div className="min-w-0">
                                            <div className="flex items-start gap-3">
                                                <FileText className="w-7 h-7 text-indigo-600 mt-1" />
                                                <div className="truncate w-full">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-slate-900 text-lg truncate">
                                                                {r.groupName ?? getStudentName(r.submittedBy) ?? `Report ${r.id.slice(0, 8)}`}
                                                            </div>
                                                            <div className="text-sm text-slate-600 mt-1 truncate">
                                                                Assignment: {r.assignmentTitle ?? `Assignment ${r.assignmentId}`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                                                        <div>
                                                            <div className="text-xs text-slate-500">Submitted At</div>
                                                            <div className="font-normal">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</div>
                                                            {r.submittedAt && (
                                                                <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(r.submittedAt), { addSuffix: true })}</div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="text-xs text-slate-500">Created</div>
                                                            <div className="font-normal">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</div>
                                                        </div>

                                                        <div>
                                                            <div className="text-xs text-slate-500">Updated</div>
                                                            <div className="font-normal">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="text-sm text-slate-700">
                                                            <div><span className="text-xs text-slate-500">Submitted by</span> <span className="font-medium">{getStudentName(r.submittedBy)}</span></div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {r.fileUrl && (
                                                                <a
                                                                    href={r.fileUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="btn bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded"
                                                                >
                                                                    Download
                                                                </a>
                                                            )}

                                                            <Button size="sm" className="btn btn-gradient-slow" onClick={() => router.push(`/lecturer/course/${courseId}/reports/${r.id}`)}>
                                                                Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: compact info card */}
                                        <div className="flex-shrink-0">
                                            <div className="bg-white flex border justify-around border-slate-100 rounded-xl p-4 shadow-sm flex-row items-center text-center gap-3">
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

                                    {/* Expanded details panel */}
                                    {expandedId === r.id && (
                                        <div className="mt-3 bg-white border border-slate-100 rounded p-4 text-sm text-slate-700">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-xs text-slate-500">Assignment ID</div>
                                                    <div className="font-medium">{r.assignmentId}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Assignment Title</div>
                                                    <div className="font-medium">{r.assignmentTitle}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-slate-500">Group ID</div>
                                                    <div className="font-medium">{r.groupId ?? '—'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Group name</div>
                                                    <div className="font-medium">{r.groupName ?? '—'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-slate-500">Submitted By</div>
                                                    <div className="font-medium">{getStudentName(r.submittedBy)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Submitted At</div>
                                                    <div className="font-medium">{r.submittedAt ?? '—'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-slate-500">Status</div>
                                                    <div className="font-medium mt-1"><StatusBadge status={r.status} /></div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Grade</div>
                                                    <div className="font-medium">{r.grade ?? '—'}</div>
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <div className="text-xs text-slate-500">Feedback</div>
                                                    <div className="font-medium whitespace-pre-wrap">{r.feedback ?? '—'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-slate-500">Graded By</div>
                                                    <div className="font-medium">{r.gradedBy ?? '—'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Graded At</div>
                                                    <div className="font-medium">{r.gradedAt ?? '—'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-slate-500">File URL</div>
                                                    <div className="text-xs font-mono truncate">{r.fileUrl ?? '—'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Version</div>
                                                    <div className="font-medium">{r.version}</div>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
