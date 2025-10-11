"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupsByCourseId } from "@/hooks/group/useGroups";
import { useEffect } from "react";

export default function GroupsPanel({
    courseId,
    refreshSignal = 0,
}: {
    courseId: string;
    refreshSignal?: number;
}) {
    const { listData: groups, loading, error, fetchByCourseId } = useGroupsByCourseId();

    useEffect(() => {
        if (courseId) fetchByCourseId(courseId, true);
    }, [courseId, refreshSignal, fetchByCourseId]);

    return (
        <Card className="border-emerald-500">
            <CardHeader>
                <CardTitle className="text-base border-b-emerald-500">Groups</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="text-sm text-slate-500">Loading groups...</div>
                )}
                {!loading && error && (
                    <div className="text-sm text-red-600">{error}</div>
                )}
                {!loading && !error && groups.length === 0 && (
                    <div className="text-sm text-slate-500">
                        No groups yet. Click <b>Create Group</b> to make one.
                    </div>
                )}
                {!loading && !error && groups.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {groups.map((g) => (
                            <Card key={g.id} className="h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-900">{g.name}</CardTitle>
                                    {g.description && (
                                        <div className="text-xs text-slate-500">{g.description}</div>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                        <div>
                                            <span className="text-slate-500">Members:</span> {g.memberCount}/{g.maxMembers}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Leader:</span> {g.leaderName || "—"}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-slate-500">Assignment:</span> {g.assignmentTitle || "—"}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Locked:</span> {g.isLocked ? "Yes" : "No"}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-500">By:</span> {g.createdBy}
                                        </div>
                                        <div className="col-span-2 text-right text-[10px] text-slate-400">
                                            Created: {new Date(g.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
