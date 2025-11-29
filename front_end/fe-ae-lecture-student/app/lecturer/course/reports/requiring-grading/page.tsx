"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpenCheck, ChevronRight, Loader2 } from "lucide-react";

import Select from "@/components/ui/select/Select";
import { useAssignments } from "@/hooks/assignment/useAssignments";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useGetReportsRequiringGrading } from "@/hooks/reports/useGetReportsRequiringGrading";
import type { CourseItem } from "@/types/courses/course.response";
import type { RequiringGradingReportItem } from "@/types/reports/reports.response";

export default function ReportsRequiringGradingPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const initialCourseId = sp.get("courseId") || "";
    const initialAssignmentId = sp.get("assignmentId") || "";

    const { listData: courses, fetchMyCourses, loading: loadingCourses } = useMyCourses();
    const { getReportsRequiringGrading, loading: loadingList } = useGetReportsRequiringGrading();
    const { listData: assignmentsData, loading: loadingAssignments, fetchAssignments } = useAssignments();

    const [courseId, setCourseId] = useState(initialCourseId);
    const [assignmentId, setAssignmentId] = useState(initialAssignmentId);
    const [items, setItems] = useState<RequiringGradingReportItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const assignments = assignmentsData?.assignments ?? [];

    useEffect(() => {
        fetchMyCourses({ asLecturer: true, page: 1, pageSize: 100 });
    }, [fetchMyCourses]);

    useEffect(() => {
        if (!courseId && courses.length > 0) {
            setCourseId(courses[0].id);
        }
    }, [courses, courseId]);

    const selectedCourse: CourseItem | undefined = useMemo(
        () => courses.find((c) => c.id === courseId),
        [courses, courseId]
    );

    const syncUrl = (cid?: string, aid?: string) => {
        const qs = new URLSearchParams(sp?.toString());
        if (cid) qs.set("courseId", cid); else qs.delete("courseId");
        if (aid) qs.set("assignmentId", aid); else qs.delete("assignmentId");
        router.replace(`/lecturer/course/reports/requiring-grading?${qs.toString()}`);
    };

    const fetchData = async () => {
        setError(null);
        try {
            const res = await getReportsRequiringGrading({
                courseId: courseId || undefined,
                assignmentId: assignmentId || undefined,
                pageNumber: 1,
                pageSize: 200,
            });
            setItems(res?.reports || []);
        } catch (e: any) {
            setError(e?.message || "Failed to load requiring-grading reports");
        }
    };

    useEffect(() => {
        // Fetch when course or assignment changes
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, assignmentId]);

    useEffect(() => {
        // When course changes, load assignments for that course
        if (!courseId) {
            // clear selected assignment when no course
            setAssignmentId("");
            return;
        }

        fetchAssignments({ courseId, pageNumber: 1, pageSize: 200, sortBy: "DueDate", sortOrder: "asc" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    return (
        <div className="p-3 sm:px-3 lg:pb-4 sm:pb-3 lg:px-4 h-full">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mb-4">
                <div className="flex items-center justify-between">
                    <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                        <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
                            <BookOpenCheck className="size-4" />
                            <button
                                className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800"
                                onClick={() => router.push(`/lecturer/course/reports${courseId ? `?courseId=${courseId}` : ""}`)}
                            >
                                Reports
                            </button>
                        </li>
                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                        <li className="max-w-[300px] truncate font-medium text-slate-900">Requiring Grading</li>
                    </ol>
                </div>
            </nav>

            <Card className="shadow-md py-0 border-slate-200 h-[calc(100%_-_0px)] max-h-full overflow-hidden flex flex-col">
                <CardHeader className="flex items-center justify-between p-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Reports Requiring Grading</h2>
                        <div className="text-sm text-slate-600 mt-1">Review submissions awaiting grading</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="min-w-[220px]">
                            <Select<string>
                                value={courseId ?? ""}
                                options={courses.map((c) => ({ value: c.id, label: `${c.courseCode} — ${c.name}` }))}
                                placeholder={loadingCourses ? "Loading courses..." : "Select a course (optional)"}
                                onChange={(v) => { setCourseId(v); syncUrl(v, assignmentId); }}
                                className="w-full"
                            />
                        </div>

                        <div className="min-w-[220px]">
                            <Select<string>
                                value={assignmentId ?? ""}
                                options={assignments.map((a) => ({ value: a.id, label: a.title }))}
                                placeholder={loadingAssignments ? "Loading assignments..." : "All assignments (optional)"}
                                onChange={(v) => { setAssignmentId(v); syncUrl(courseId, v); }}
                                className="w-full"
                                disabled={!courseId || loadingAssignments}
                            />
                        </div>

                        <Button size="sm" className="text-violet-800 hover:text-violet-500" variant="outline" onClick={fetchData}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 min-h-0">
                    <Separator />

                    {loadingList ? (
                        <div className="flex items-center justify-center p-8 text-slate-600">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading...
                        </div>
                    ) : error ? (
                        <div className="p-6 text-red-600">{error}</div>
                    ) : items.length === 0 ? (
                        <div className="p-6 text-sm italic text-slate-600">No reports requiring grading found.</div>
                    ) : (
                        <div className="overflow-auto max-h-[calc(100vh-220px)]">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
                                    <tr>
                                        <th className="text-left font-medium px-4 py-2">Assignment</th>
                                        <th className="text-left font-medium px-4 py-2">Group</th>
                                        <th className="text-left font-medium px-4 py-2">Submitted By</th>
                                        <th className="text-left font-medium px-4 py-2">Submitted</th>
                                        <th className="text-left font-medium px-4 py-2">Status</th>
                                        <th className="text-left font-medium px-4 py-2">Grade</th>
                                        <th className="text-left font-medium px-4 py-2">Feedback</th>
                                        <th className="text-left font-medium px-4 py-2">Graded By</th>
                                        <th className="text-left font-medium px-4 py-2">Version</th>
                                        <th className="text-left font-medium px-4 py-2">File</th>
                                        <th className="text-left font-medium px-4 py-2">Updated</th>
                                        <th className="text-left font-medium px-4 py-2">Created</th>
                                        <th className="text-left font-medium px-4 py-2">Group Submission</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((r) => (
                                        <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 align-top">
                                            <td className="px-4 py-2">
                                                <div className="font-medium text-slate-900 truncate max-w-[280px]">{r.assignmentTitle}</div>
                                            </td>

                                            <td className="px-4 py-2">
                                                <div className="text-slate-800">{r.groupName ?? "—"}</div>
                                            </td>

                                            <td className="px-4 py-2">{r.submittedByName ?? r.submittedBy ?? "—"}</td>

                                            <td className="px-4 py-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</td>

                                            <td className="px-4 py-2">{String(r.status)}</td>

                                            <td className="px-4 py-2">{r.grade ?? "—"}</td>

                                            <td className="px-4 py-2 max-w-[260px]">
                                                <div className="truncate" title={r.feedback || undefined}>{r.feedback ?? "—"}</div>
                                            </td>

                                            <td className="px-4 py-2">{r.gradedByName ?? r.gradedBy ?? "—"}</td>

                                            <td className="px-4 py-2">{r.version ?? "—"}</td>

                                            <td className="px-4 py-2">
                                                {r.fileUrl ? (
                                                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">Download</a>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            <td className="px-4 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>

                                            <td className="px-4 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>

                                            <td className="px-4 py-2">{typeof r.isGroupSubmission === "boolean" ? (r.isGroupSubmission ? "Yes" : "No") : (r.groupId ? "Yes" : "No")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
