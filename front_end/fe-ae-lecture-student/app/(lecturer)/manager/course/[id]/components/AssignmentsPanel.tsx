"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssignmentsByCourseId } from "@/hooks/assignment/useAssignments";
import { useEffect } from "react";

export default function AssignmentsPanel({
    courseId,
    refreshSignal = 0,
}: {
    courseId: string;
    refreshSignal?: number;
}) {
    const { listData: assignments, loading, error, fetchByCourseId } = useAssignmentsByCourseId();

    useEffect(() => {
        if (courseId) fetchByCourseId(courseId, true);
    }, [courseId, refreshSignal, fetchByCourseId]);

    return (
        <Card className="border-emerald-500">
            <CardHeader>
                <CardTitle className="text-base">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="text-sm text-slate-500">Loading assignments...</div>
                )}
                {!loading && error && (
                    <div className="text-sm text-red-600">{error}</div>
                )}
                {!loading && !error && assignments.length === 0 && (
                    <div className="text-sm text-slate-500">No assignments yet. Click <b>New Assignment</b> to add one.</div>
                )}
                {!loading && !error && assignments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {assignments.map((a) => (
                            <Card key={a.id} className="h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-900">{a.title}</CardTitle>
                                    {a.description && (
                                        <div className="text-xs text-slate-500 line-clamp-2">{a.description}</div>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-0 text-xs text-slate-600 space-y-1">
                                    <div><span className="text-slate-500">Due:</span> {new Date(a.dueDate).toLocaleString()}</div>
                                    <div><span className="text-slate-500">Extended:</span> {new Date(a.extendedDueDate).toLocaleString()}</div>
                                    <div><span className="text-slate-500">Format:</span> {a.format || "—"}</div>
                                    <div className="line-clamp-2"><span className="text-slate-500">Criteria:</span> {a.gradingCriteria || "—"}</div>
                                    <div className="text-[10px] text-slate-400 text-right">Created: {new Date(a.createdAt).toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
