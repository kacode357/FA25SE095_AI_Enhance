"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { Book, ChevronRight, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useAssignmentReports } from "@/hooks/reports/useAssignmentReports";
import { useExportAssignmentGrades } from "@/hooks/reports/useExportAssignmentGrades";
import { useGetLateSubmissions } from "@/hooks/reports/useGetLateSubmissions";
import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { useGetReportsRequiringGrading } from "@/hooks/reports/useGetReportsRequiringGrading";
import type { ReportBase } from "@/types/reports/reports.response";
import { ReportStatus } from "@/types/reports/reports.response";
import LateSubmissions from "../../reports/late-submitssion/LateSubmissions";
import ReportListItem from "./components/ReportListItem";
import ReportsHeader from "./components/ReportsHeader";

export default function LecturerAssignmentReportsPage() {
    const params = useParams();
    const sp = useSearchParams();
    const courseId = typeof params?.id === "string" ? params.id : "";
    const assignmentId = sp.get("assignmentId") || "";

    const { fetchAssignmentReports, loading: loadingList } = useAssignmentReports();
    const { data: assignmentData, fetchAssignment } = useAssignmentById();
    const { getReportById, loading: loadingDetail } = useGetReportById();
    const { data: course, fetchCourseById } = useGetCourseById();
    const { students: enrolledStudents, fetchCourseStudents } = useCourseStudents("");
    const { exportGrades, loading: exporting } = useExportAssignmentGrades();

    const [items, setItems] = useState<ReportBase[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"all" | "late" | "requiring">("all");

    // Late submissions
    const { getLateSubmissions, loading: loadingLate } = useGetLateSubmissions();
    const [lateItems, setLateItems] = useState<any[]>([]);

    // Reports requiring grading
    const { getReportsRequiringGrading, loading: loadingRequiring } = useGetReportsRequiringGrading();
    const [requiringItems, setRequiringItems] = useState<any[]>([]);

    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!assignmentId) return;
            try {
                const res = await fetchAssignmentReports({ assignmentId, pageNumber: 1, pageSize: 200 });
                if (res?.reports) {
                    const filtered = (res.reports as ReportBase[]).filter((r) => r.status !== ReportStatus.Draft);
                    setItems(filtered);
                }
            } catch (e: any) {
                setError(e?.message || "Failed to load reports");
            }
        })();
    }, [assignmentId]);

    useEffect(() => {
        // Fetch late submissions when tab selected
        if (activeTab !== "late") return;
        (async () => {
            try {
                const res = await getLateSubmissions({ courseId: courseId || undefined, assignmentId: assignmentId || undefined, pageNumber: 1, pageSize: 500 });
                setLateItems(res?.reports || []);
            } catch (e: any) {
                // keep simple error handling per-tab
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, courseId, assignmentId]);

    useEffect(() => {
        // Fetch requiring-grading when tab selected
        if (activeTab !== "requiring") return;
        (async () => {
            try {
                const res = await getReportsRequiringGrading({ courseId: courseId || undefined, assignmentId: assignmentId || undefined, pageNumber: 1, pageSize: 500 });
                setRequiringItems(res?.reports || []);
            } catch (e: any) {
                // ignore for now
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, courseId, assignmentId]);

    useEffect(() => {
        if (!assignmentId) return;
        fetchAssignment(assignmentId).catch(() => {
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Prefer the fetched assignment title, then any report-provided title.
        // If neither is available yet, show a neutral label instead of the raw id.
        return (
            assignmentData?.assignment?.title || items?.[0]?.assignmentTitle || `Assignment`
        );
    }, [items, assignmentId, assignmentData]);

    const hasGraded = useMemo(() => {
        return items.some((r) => r.status === ReportStatus.Graded);
    }, [items]);

    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto mt-2 min-h-screen overflow-auto">
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
                                My Courses
                            </button>
                        </li>

                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />

                        <li className="text-slate-500 max-w-[220px] truncate">
                            <button
                                onClick={() => router.push(courseId ? `/lecturer/course/${courseId}?tab=assignments` : '/lecturer/course')}
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

            {/* Tabs (styled like horizontal link tabs with underline) */}
            <div className="mb-3">
                <nav aria-label="Report tabs" className="border-b border-slate-100">
                    <ul role="tablist" className="flex gap-8 -mb-px">
                        <li role="presentation">
                            <button
                                role="tab"
                                    aria-selected={activeTab === "all" ? "true" : "false"}
                                    onClick={() => setActiveTab("all")}
                                    className={`pb-3 pt-4 cursor-pointer text-sm ${activeTab === "all" ? "text-violet-600 font-medium border-b-2 border-violet-600" : "text-slate-600 hover:text-slate-800"}`}
                            >
                                All Reports
                            </button>
                        </li>

                        <li role="presentation">
                            <button
                                role="tab"
                                    aria-selected={activeTab === "late" ? "true" : "false"}
                                    onClick={() => setActiveTab("late")}
                                    className={`pb-3 pt-4 cursor-pointer text-sm ${activeTab === "late" ? "text-violet-600 font-medium border-b-2 border-violet-600" : "text-slate-600 hover:text-slate-800"}`}
                            >
                                Late Submissions
                            </button>
                        </li>

                        <li role="presentation">
                            <button
                                role="tab"
                                    aria-selected={activeTab === "requiring" ? "true" : "false"}
                                    onClick={() => setActiveTab("requiring")}
                                    className={`pb-3 pt-4 cursor-pointer text-sm ${activeTab === "requiring" ? "text-violet-600 font-medium border-b-2 border-violet-600" : "text-slate-600 hover:text-slate-800"}`}
                            >
                                Requiring Grading
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            <Card className="shadow-md py-0 gap-0 border-slate-200 max-h-[calc(100vh-160px)] overflow-y-auto">
                <CardHeader className="flex flex-row items-start justify-between p-4">
                    <ReportsHeader
                        assignmentTitle={assignmentTitle}
                        count={items.length}
                        hasGraded={hasGraded}
                        exporting={exporting}
                        assignmentId={assignmentId}
                        exportGrades={exportGrades}
                    />
                </CardHeader>



                <CardContent className="p-0">
                    <Separator />

                    {activeTab === "all" && (
                        <>
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
                                        <ReportListItem
                                            key={r.id}
                                            report={r}
                                            getStudentName={getStudentName}
                                            router={router}
                                            courseId={courseId}
                                            expandedId={expandedId}
                                            setExpandedId={setExpandedId}
                                        />
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    {activeTab === "late" && (
                        <div>
                            {loadingLate ? (
                                <div className="flex items-center justify-center p-8 text-slate-600">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading late submissions...
                                </div>
                            ) : (
                                <LateSubmissions items={lateItems} loading={loadingLate} error={null} />
                            )}
                        </div>
                    )}

                    {activeTab === "requiring" && (
                        <div>
                            {loadingRequiring ? (
                                <div className="flex items-center justify-center p-8 text-slate-600">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading...
                                </div>
                            ) : requiringItems.length === 0 ? (
                                <div className="p-6 text-slate-600">No reports requiring grading found.</div>
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
                                                <th className="text-left font-medium px-4 py-2">Feedback</th>
                                                <th className="text-left font-medium px-4 py-2">Graded By</th>
                                                <th className="text-left font-medium px-4 py-2">Graded At</th>
                                                <th className="text-left font-medium px-4 py-2">Version</th>
                                                <th className="text-left font-medium px-4 py-2">File</th>
                                                <th className="text-left font-medium px-4 py-2">Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requiringItems.map((r: any) => (
                                                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 align-top">
                                                    <td className="px-4 py-2">
                                                        <div className="font-medium text-slate-900 truncate max-w-[280px]">{r.assignmentTitle || r.assignmentId}</div>
                                                        <div className="text-xs text-slate-500">#{r.id?.slice?.(0, 8)}</div>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="text-slate-800">{r.groupName || r.submittedBy || "—"}</div>
                                                        {r.groupId && <div className="text-xs text-slate-500">Group: {r.groupId}</div>}
                                                    </td>
                                                    <td className="px-4 py-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</td>
                                                    <td className="px-4 py-2">{String(r.status)}</td>
                                                    <td className="px-4 py-2">{r.grade ?? "—"}</td>
                                                    <td className="px-4 py-2 max-w-[260px]"><div className="truncate" title={r.feedback || undefined}>{r.feedback ?? "—"}</div></td>
                                                    <td className="px-4 py-2">{r.gradedBy ?? "—"}</td>
                                                    <td className="px-4 py-2">{r.gradedAt ? new Date(r.gradedAt).toLocaleString() : "—"}</td>
                                                    <td className="px-4 py-2">{r.version}</td>
                                                    <td className="px-4 py-2">{r.fileUrl ? (<a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">Download</a>) : "—"}</td>
                                                    <td className="px-4 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
