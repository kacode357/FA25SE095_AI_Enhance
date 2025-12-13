"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAssignments } from "@/hooks/assignment/useAssignments";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useGetReportsRequiringGrading } from "@/hooks/reports/useGetReportsRequiringGrading";
import type { CourseItem } from "@/types/courses/course.response";
import type { RequiringGradingReportItem } from "@/types/reports/reports.response";
import { ChevronDown, ChevronUp, ClipboardPenLine, Loader2, PencilOff, X } from "lucide-react";
import RejectForm from "../[reportId]/components/RejectForm";
import RevisionForm from "../[reportId]/components/RevisionForm";
import StatusBadge from "../utils/status";
import GradeForm from "./components/GradeForm";

function Collapse({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const content = contentRef.current;
        if (!wrapper || !content) return;

        const update = () => {
            if (isOpen) {
                wrapper.style.maxHeight = `${content.scrollHeight}px`;
                wrapper.setAttribute("aria-hidden", "false");
            } else {
                wrapper.style.maxHeight = `0px`;
                wrapper.setAttribute("aria-hidden", "true");
            }
        };

        // run immediately
        update();

        // observe content size changes and update maxHeight when open
        let ro: ResizeObserver | undefined;
        try {
            ro = new ResizeObserver(() => {
                if (isOpen) wrapper.style.maxHeight = `${content.scrollHeight}px`;
            });
            ro.observe(content);
        } catch (e) {
            // Ignore if ResizeObserver unavailable
        }

        return () => {
            if (ro) ro.disconnect();
        };
    }, [isOpen, children]);

    return (
        <div
            ref={wrapperRef}
            className="mt-3 border-l-2 border-slate-100 pl-4 text-xs text-slate-700 overflow-hidden transition-all duration-200 ease-out"
        >
            <div ref={contentRef}>{children}</div>
        </div>
    );
}

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
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [revisionReportId, setRevisionReportId] = useState<string | null>(null);
    const [rejectReportId, setRejectReportId] = useState<string | null>(null);

    // Scroll grade form into view when opened (handles nested scrollable containers)
    useEffect(() => {
        if (!editingReportId) return;
        const id = `grade-form-${editingReportId}`;

        const scrollToForm = () => {
            const el = document.getElementById(id);
            if (!el) return;

            // find nearest scrollable ancestor (overflow:auto/scroll)
            let parent: HTMLElement | null = el.parentElement;
            let scrollParent: HTMLElement | null = null;
            while (parent && parent !== document.body) {
                const style = getComputedStyle(parent);
                const oy = style.overflowY;
                if (oy === "auto" || oy === "scroll") {
                    scrollParent = parent;
                    break;
                }
                parent = parent.parentElement;
            }

            if (scrollParent) {
                // scroll the inner container so the element is visible inside it
                const parentRect = scrollParent.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const top = elRect.top - parentRect.top + scrollParent.scrollTop;
                scrollParent.scrollTo({ top: Math.max(0, top - 24), behavior: "smooth" });

                // also nudge the window so the inner container (and element) are visible in viewport
                const rectAfter = el.getBoundingClientRect();
                if (rectAfter.top < 0 || rectAfter.bottom > window.innerHeight) {
                    window.scrollBy({ top: rectAfter.top - window.innerHeight * 0.2, behavior: "smooth" });
                }
            } else {
                // fallback to window scroll
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        // run a couple times with small delays to account for rendering/layout
        const t1 = setTimeout(scrollToForm, 60);
        const t2 = setTimeout(scrollToForm, 260);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [editingReportId]);

    // Use shared StatusBadge component (STATUS_MAP) for consistent labels and colors

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
        <>
            <CardHeader className="flex items-center justify-between px-0 pt-0">
                <div className="text-sm text-slate-600">Review submissions awaiting grading</div>
                <div className="flex items-center gap-2">
                    {/* <div className="min-w-[220px]">
                        <Select<string>
                            value={courseId ?? ""}
                            options={courses.map((c) => ({ value: c.id, label: `${c.courseCode} — ${c.name}` }))}
                            placeholder={loadingCourses ? "Loading courses..." : "Select a course (optional)"}
                            onChange={(v) => { setCourseId(v); syncUrl(v, assignmentId); }}
                            className="w-full"
                        />
                    </div> */}

                    {/* <div className="min-w-[220px]">
                        <Select<string>
                            value={assignmentId ?? ""}
                            options={assignments.map((a) => ({ value: a.id, label: a.title }))}
                            placeholder={loadingAssignments ? "Loading assignments..." : "All assignments (optional)"}
                            onChange={(v) => { setAssignmentId(v); syncUrl(courseId, v); }}
                            className="w-full"
                            disabled={!courseId || loadingAssignments}
                        />
                    </div> */}

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
                        <ul className="divide-y">
                            {items.map((r) => {
                                const isOpen = expandedId === r.id;
                                const showGroup = typeof r.isGroupSubmission === "boolean" ? r.isGroupSubmission : !!r.groupId;
                                return (
                                    <li key={r.id} className="pb-3 pt-2 px-4 bg-slate-50 rounded-lg hover:bg-slate-100">
                                        <div className="flex items-start cursor-pointer justify-between gap-4">
                                            <div
                                                className="flex-1 min-w-0"
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setExpandedId(isOpen ? null : r.id)}
                                                onKeyDown={(e: any) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        setExpandedId(isOpen ? null : r.id);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium text-slate-900 truncate">{r.assignmentTitle || "—"}</div>
                                                    <div className="text-xs text-slate-500">·</div>
                                                    <div className="text-xs text-slate-500">{r.submittedByName ?? "—"}</div>
                                                </div>
                                                <div className="text-xs  text-slate-600 mt-1 flex items-center gap-2">
                                                    {showGroup && (
                                                        <>
                                                            <div className="cursor-text">Group: <span className="text-slate-800">{r.groupName ?? "—"}</span></div>
                                                            <div className="cursor-text">•</div>
                                                        </>
                                                    )}

                                                    <div className="cursor-text">Submitted: <span className="text-slate-800">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</span></div>
                                                    <div className="cursor-text">•</div>
                                                    <div className="cursor-text">Status: <span className="text-slate-800"><StatusBadge status={r.status} /></span></div>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 ml-2">
                                                <button
                                                    onClick={(e: any) => { e.stopPropagation(); setExpandedId(isOpen ? null : r.id); }}
                                                    className="p-2 rounded hover:bg-slate-100"
                                                >
                                                    {isOpen ? <ChevronUp className="w-4 cursor-pointer h-4" /> : <ChevronDown className="w-4 cursor-pointer h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Collapse isOpen={isOpen}>
                                            <div className="relative pb-15">
                                                <div className="bg-slate-50 rounded-md p-4 text-xs text-slate-700">
                                                    <div className="flex flex-wrap items-start gap-6">
                                                        <div className="flex-1 min-w-[140px]">
                                                            <div className=" text-slate-500 text-[11px]">Grade</div>
                                                            <div className=" text-slate-900">{r.grade ?? "—"}</div>
                                                        </div>

                                                        <div className="flex-1 min-w-[140px]">
                                                            <div className="text-slate-500 text-[11px]">Graded By</div>
                                                            <div className="text-slate-900">{r.gradedByName ?? r.gradedBy ?? "—"}</div>
                                                        </div>

                                                        <div className="flex-1 min-w-[140px]">
                                                            <div className=" text-center text-slate-500 text-[11px]">Version</div>
                                                            <div className=" text-center text-slate-900">{r.version ?? "—"}</div>
                                                        </div>

                                                        <div className="flex-1 min-w-[140px]">
                                                            <div className="text-center text-slate-500 text-[11px]">File</div>
                                                            <div className="text-center text-slate-900">{r.fileUrl ? (<a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">Download</a>) : "—"}</div>
                                                        </div>

                                                        <div className="flex-1 min-w-[140px]">
                                                            <div className="text-slate-500 text-center text-[11px]">Group Submission</div>
                                                            <div className="text-center text-slate-900">{typeof r.isGroupSubmission === "boolean" ? (r.isGroupSubmission ? "Yes" : "No") : (r.groupId ? "Yes" : "No")}</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="bg-white border border-slate-100 rounded p-3 text-slate-800 text-sm max-w-full">
                                                            <div className="text-slate-500 text-[11px] mb-1">Feedback</div>
                                                            <div className="whitespace-pre-wrap break-words">{r.feedback ?? "—"}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute left-4 bottom-2 text-xs text-slate-400 flex flex-row items-center gap-1">
                                                    <div className="text-xs">Created: <span className="text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</span></div>
                                                    <div className="text-xs">Updated: <span className="text-slate-500">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</span></div>
                                                </div>

                                                <div className="absolute right-4 bottom-2 flex items-center gap-2">
                                                    {/* Request Revision button (left of Change Grade) */}
                                                    {revisionReportId !== r.id && (
                                                        <Button
                                                            size="sm"
                                                            className="cursor-pointer text-blue-500 shadow-lg"
                                                            onClick={(e: any) => { e.stopPropagation(); setRevisionReportId(r.id); setEditingReportId(null); setRejectReportId(null); setExpandedId(r.id); }}
                                                        >
                                                            <PencilOff className="w-4 h-4 mr-1" />
                                                            Request Revision
                                                        </Button>
                                                    )}

                                                    {/* Reject Report button */}
                                                    {rejectReportId !== r.id && (
                                                        <Button
                                                            size="sm"
                                                            className="cursor-pointer text-red-500 shadow-lg"
                                                            onClick={(e: any) => { e.stopPropagation(); setRejectReportId(r.id); setRevisionReportId(null); setEditingReportId(null); setExpandedId(r.id); }}
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Reject Report
                                                        </Button>
                                                    )}

                                                    {/* Change Grade button */}
                                                    {editingReportId !== r.id && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-sm btn btn-gradient-slow text-slate-600 hover:text-slate-700"
                                                            onClick={(e: any) => { e.stopPropagation(); setExpandedId(r.id); setEditingReportId(r.id); setRevisionReportId(null); setRejectReportId(null); }}
                                                        >
                                                            <ClipboardPenLine className="w-4 h-4" />
                                                            Grade
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        {editingReportId === r.id && (
                                            <div id={`grade-form-${r.id}`} className="mt-4">
                                                <GradeForm
                                                    reportId={r.id}
                                                    detail={r}
                                                    onSuccess={(patch: any) => {
                                                        // Update item in list with patched fields
                                                        setItems((prev) => prev.map((it) => (it.id === r.id ? { ...it, ...(patch || {}) } : it)));
                                                        setEditingReportId(null);
                                                        setError(null);
                                                    }}
                                                    onCancel={() => setEditingReportId(null)}
                                                />
                                            </div>
                                        )}

                                        {revisionReportId === r.id && (
                                            <div id={`revision-form-${r.id}`} className="mt-4">
                                                <RevisionForm
                                                    reportId={r.id}
                                                    onSuccess={(patch: any) => {
                                                        setItems((prev) => prev.map((it) => (it.id === r.id ? { ...it, ...(patch || {}) } : it)));
                                                        setRevisionReportId(null);
                                                        setError(null);
                                                    }}
                                                    onCancel={() => setRevisionReportId(null)}
                                                />
                                            </div>
                                        )}

                                        {rejectReportId === r.id && (
                                            <div id={`reject-form-${r.id}`} className="mt-4">
                                                <RejectForm
                                                    reportId={r.id}
                                                    onSuccess={(patch: any) => {
                                                        setItems((prev) => prev.map((it) => (it.id === r.id ? { ...it, ...(patch || {}) } : it)));
                                                        setRejectReportId(null);
                                                        setError(null);
                                                    }}
                                                    onCancel={() => setRejectReportId(null)}
                                                />
                                            </div>
                                        )}
                                        </Collapse>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </CardContent>
        </>
    );
}
