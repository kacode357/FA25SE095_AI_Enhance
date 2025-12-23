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
import type { ReportBase } from "@/types/reports/reports.response";
import { ReportStatus } from "@/types/reports/reports.response";
import ReportListItem from "./components/ReportListItem";
import ReportsHeader from "./components/ReportsHeader";
import LateSubmissions from "./late-submitssion/LateSubmissions";
import ReportsRequiringGradingPage from "./requiring-grading/page";

export default function LecturerAssignmentReportsPage() {
    const params = useParams();
    const sp = useSearchParams();
    const courseId = typeof params?.id === "string" ? params.id : "";
    const assignmentId = sp.get("assignmentId") || "";
    const initialTab = (sp.get("tab") as "all" | "late" | "requiring") || "all";

    const { fetchAssignmentReports, loading: loadingList } = useAssignmentReports();
    const { data: assignmentData, fetchAssignment } = useAssignmentById();
    const { getReportById, loading: loadingDetail } = useGetReportById();
    const { data: course, fetchCourseById } = useGetCourseById();
    const { students: enrolledStudents, fetchCourseStudents } = useCourseStudents("");
    const { exportGrades, loading: exporting } = useExportAssignmentGrades();

    const [items, setItems] = useState<ReportBase[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"all" | "late" | "requiring">(initialTab);

    // Late submissions
    const { getLateSubmissions, loading: loadingLate } = useGetLateSubmissions();
    const [lateItems, setLateItems] = useState<any[]>([]);

    // Reports requiring grading handled by separate component

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

    // requiring-grading fetch moved into `ReportsRequiringGradingPage`

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

    const syncTab = (tab: "all" | "late" | "requiring") => {
        try {
            const qs = new URLSearchParams(sp?.toString());
            if (tab) qs.set("tab", tab); else qs.delete("tab");
            const base = courseId ? `/lecturer/course/${courseId}/reports` : `/lecturer/course/reports`;
            router.replace(`${base}?${qs.toString()}`);
        } catch (err) {
            // fallback: ignore
        }
    };

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
                                        aria-selected={activeTab === "all"}
                                        onClick={() => { setActiveTab("all"); syncTab("all"); }}
                                        className={`pb-3 pt-4 cursor-pointer text-sm ${activeTab === "all" ? "text-violet-600 font-medium border-b-2 border-violet-600" : "text-slate-600 hover:text-slate-800"}`}
                                >
                                All Reports
                            </button>
                        </li>

                        <li role="presentation">
                            <button
                                    role="tab"
                                        aria-selected={activeTab === "requiring"}
                                        onClick={() => { setActiveTab("requiring"); syncTab("requiring"); }}
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
                        showExport={activeTab !== 'requiring'}
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
                                <div className="p-6 text-sm italic text-slate-600">No reports were submitted yet for this assignment.</div>
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
                        <div className="px-3 pb-3 sm:px-3 lg:px-4 sm:pb-3 lg:pb-4 h-full">
                            <ReportsRequiringGradingPage />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
