"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import React from "react";

type Props = {
    detail: any;
    course?: any;
    enrolledStudents?: any[];
    getStudentName: (id?: string | null) => string;
    statusBadgeElement: React.ReactNode;
    normalizeAssignmentDescription?: string;
};

export default function ReportInfoDetails({ detail, course, enrolledStudents, getStudentName, statusBadgeElement, normalizeAssignmentDescription = "" }: Props) {
    return (
        <div className="space-y-6 text-sm text-slate-700 h-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="text-xs text-slate-500">Assignment Title</div>
                    <div className="font-medium text-xs">{detail.assignmentTitle ?? '—'}</div>
                </div>

                <div>
                    <div className="text-xs text-center text-slate-500">Max Points</div>
                    <div className="font-medium text-xs text-center">{typeof detail.assignmentMaxPoints === 'number' ? detail.assignmentMaxPoints : '—'}</div>
                </div>

                <div>
                    <div className="text-xs text-center text-slate-500">Status</div>
                    <div className="font-medium text-center text-xs mt-1">{statusBadgeElement}</div>
                </div>
            </div>

            {normalizeAssignmentDescription && (
                <div>
                    <div className="text-xs text-slate-500">Assignment Description</div>
                    <div className="mt-1 text-slate-700 bg-white p-5 border-slate-200 rounded-md shadow-md">
                        <div dangerouslySetInnerHTML={{ __html: normalizeAssignmentDescription }} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-200">
                <div>
                    <div className="text-xs text-slate-500">Due Date</div>
                    <div className="font-medium text-xs">{detail.assignmentDueDate ? new Date(detail.assignmentDueDate).toLocaleString() : '—'}</div>
                    {detail.assignmentDueDate && (
                        <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(detail.assignmentDueDate), { addSuffix: true })}</div>
                    )}
                </div>

                <div>
                    <div className="text-xs text-slate-500">Course</div>
                    <div className="font-medium text-xs">{detail.courseCode ? `${detail.courseCode} — ${detail.courseName ?? ''}` : (detail.courseName ?? '—')}</div>
                </div>

                <div>
                    <div className="text-xs text-slate-500">Group Name</div>
                    <div className="font-mono text-xs text-slate-700 truncate">{detail.groupName ?? '—'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <div className="text-xs text-slate-500">Submitted By</div>
                    <div className="font-medium text-xs">{getStudentName(detail.submittedBy)}</div>
                </div>

                <div>
                    <div className="text-xs text-slate-500">Submitted At</div>
                    <div className="font-medium text-xs">{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : '—'}</div>
                    {detail.submittedAt && (
                        <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(detail.submittedAt), { addSuffix: true })}</div>
                    )}
                </div>

                <div>
                    <div className="text-xs text-slate-500">Is Group Submission</div>
                    <div className="font-medium text-xs">{detail.isGroupSubmission ? 'Yes' : 'No'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <div className="text-xs text-slate-500">Grade</div>
                    <div className="font-medium text-xs">{detail.grade ?? '—'}</div>
                </div>

                <div>
                    <div className="text-xs text-slate-500">Version</div>
                    <div className="font-medium text-xs">{detail.fullVersion ? detail.fullVersion : (typeof detail.version === 'number' ? detail.version : '—')}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <div className="text-xs text-slate-500">Graded By</div>
                    <div className="font-medium text-xs">{detail.gradedBy ?? '—'}</div>
                </div>

                <div>
                    <div className="text-xs text-slate-500">Graded At</div>
                    <div className="font-medium text-xs">{detail.gradedAt ? new Date(detail.gradedAt).toLocaleString() : '—'}</div>
                </div>

                <div>
                    <div className="text-xs text-slate-500">File URL</div>
                    <div className="text-xs font-mono truncate">{detail.fileUrl ?? '—'}</div>
                    {detail.fileUrl && (
                        <div className="mt-2">
                            <a href={detail.fileUrl} target="_blank" rel="noreferrer" className="btn bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded">Download</a>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <div className="text-xs text-slate-500">Feedback</div>
                <div className="mt-1 text-slate-700 whitespace-pre-wrap">{detail.feedback ?? '—'}</div>
            </div>

            <div className="grid grid-cols-1 border-t border-slate-100 pt-5 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-500">Created At:</div>
                    <div className=" text-xs">{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '—'}</div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-500">Updated At:</div>
                    <div className=" text-xs">{detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : '—'}</div>
                </div>
            </div>
        </div>
    );
}
