"use client";

import { Button } from "@/components/ui/button";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FileText } from "lucide-react";
import StatusBadge from "../utils/status";
import ReportRightCard from "./ReportRightCard";

interface Props {
    report: any;
    getStudentName: (id?: string | null) => string;
    router: any;
    courseId: string;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
}

export default function ReportListItem({ report: r, getStudentName, router, courseId, expandedId, setExpandedId }: Props) {
    return (
        <li key={r.id} className="p-4 hover:bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,320px] gap-3 items-start">
                <div className="min-w-0">
                    <div className="flex items-start gap-3">
                        <FileText className="w-7 h-7 text-indigo-600 mt-1" />
                        <div className="truncate w-full">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold flex flex-col text-slate-900 text-sm truncate">
                                        <span className="text-[11px] font-normal text-slate-500">Submitted by</span>
                                        {r.groupName ?? getStudentName(r.submittedBy) ?? `Report ${r.id.slice(0, 8)}`}
                                    </div>
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
                                        <span className="text-xs text-slate-500">File URL</span>
                                        <div className="text-xs font-mono">
                                            {r.fileUrl ? (
                                                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{r.fileUrl}</a>
                                            ) : (
                                                '-'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                                                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                                <div>
                                    <div className="text-xs mb-2 text-slate-500">Submitted At</div>
                                    <div className="font-normal">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</div>
                                    {r.submittedAt && (
                                        <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(r.submittedAt), { addSuffix: true })}</div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-xs text-slate-500 mb-2">Created</div>
                                    <div className="font-normal">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-500 mb-2">Updated</div>
                                    <div className="font-normal">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
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

                <ReportRightCard report={r} />
            </div>

            {expandedId === r.id && (
                <div className="mt-3 bg-white border border-slate-100 rounded p-4 text-sm text-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    );
}
