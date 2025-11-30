"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import GroupAssignControls from "./GroupAssignControls";

type Props = {
    a: any;
    assignedGroupsState: any[];
    refetchDetail: () => void;
};

export default function AssignmentGroups({ a, assignedGroupsState, refetchDetail }: Props) {
    return (
        <>
            <section className="pb-10">
                <div className="mb-2 -mt-5 text-sm text-slate-500">Assigned Groups ({assignedGroupsState.length ?? a?.assignedGroupsCount ?? 0})</div>
                {assignedGroupsState && assignedGroupsState.length > 0 ? (
                    <ScrollArea className="max-h-72">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {assignedGroupsState.map((g) => (
                                <div key={g.id} className="px-3 py-2 text-sm border border-violet-400 rounded-md bg-slate-50">
                                    <div className="font-medium">{g.name}</div>
                                    <div className="text-xs text-slate-500">
                                        Members: {g.memberCount}/{g.maxMembers}
                                        {g.leaderName ? ` • Leader: ${g.leaderName}` : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-sm text-slate-500">No groups assigned.</div>
                )}
            </section>

            {a.isGroupAssignment && (
                <section>
                    <GroupAssignControls
                        courseId={a.courseId}
                        assignment={{
                            id: a.id,
                            assignedGroupsCount: a.assignedGroupsCount,
                            assignedGroups: a.assignedGroups,
                        }}
                        status={a.status}
                        onChanged={refetchDetail}
                    />
                </section>
            )}
        </>
    );
}
