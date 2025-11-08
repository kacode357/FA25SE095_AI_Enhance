// app/lecture/manager/course/[id]/assignments/components/GroupAssignControls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAssignGroups } from "@/hooks/assignment/useAssignGroups";
import { useUnassignGroups } from "@/hooks/assignment/useUnassignGroups";
import { AssignmentService } from "@/services/assignment.services";
import { AssignmentItem, GroupItem } from "@/types/assignments/assignment.response";
import { useEffect, useMemo, useState } from "react";

type Props = {
  courseId: string;
  assignment: Pick<AssignmentItem, "id" | "assignedGroupsCount"> & {
    assignedGroups?: GroupItem[];
  };
  onChanged?: () => void; // gọi để parent refetch detail
};

export default function GroupAssignControls({ courseId, assignment, onChanged }: Props) {
  const [unassigned, setUnassigned] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [pickUnassigned, setPickUnassigned] = useState<Record<string, boolean>>({});
  const [pickAssigned, setPickAssigned] = useState<Record<string, boolean>>({});

  const { assignGroups, loading: loadingAssign } = useAssignGroups();
  const { unassignGroups, loading: loadingUnassign } = useUnassignGroups();

  const assignedList = assignment.assignedGroups ?? [];

  const refreshUnassigned = async () => {
    setLoading(true);
    try {
      const res = await AssignmentService.getUnassignedGroupsInCourse(courseId);
      setUnassigned(res.unassignedGroups || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) refreshUnassigned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, assignment.id]);

  const selectedUnassignedIds = useMemo(
    () => Object.entries(pickUnassigned).filter(([, v]) => v).map(([k]) => k),
    [pickUnassigned]
  );
  const selectedAssignedIds = useMemo(
    () => Object.entries(pickAssigned).filter(([, v]) => v).map(([k]) => k),
    [pickAssigned]
  );

  const clearSelection = () => {
    setPickUnassigned({});
    setPickAssigned({});
  };

  const handleAssign = async () => {
    if (selectedUnassignedIds.length === 0) return;
    const res = await assignGroups({
      assignmentId: assignment.id,
      groupIds: selectedUnassignedIds,
    });
    if (res?.success) {
      clearSelection();
      await Promise.all([refreshUnassigned()]);
      onChanged?.();
    }
  };

  const handleUnassign = async () => {
    if (selectedAssignedIds.length === 0) return;
    const res = await unassignGroups({
      assignmentId: assignment.id,
      groupIds: selectedAssignedIds,
    });
    if (res?.success) {
      clearSelection();
      await Promise.all([refreshUnassigned()]);
      onChanged?.();
    }
  };

  return (
    <div className="rounded-md border border-slate-200 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium text-[#000D83]">Manage Groups</div>
        <div className="flex gap-2">
          <Button className="text-violet-800 hover:text-violet-500" size="sm" variant="secondary" onClick={refreshUnassigned} disabled={loading}>
            Reload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unassigned column */}
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 text-sm font-medium">Unassigned in course</div>
          <div className="max-h-64 overflow-auto pr-1 space-y-2">
            {loading ? (
              <div className="text-sm text-slate-500 p-2">Loading...</div>
            ) : unassigned.length === 0 ? (
              <div className="text-sm text-slate-500 p-2">No unassigned groups.</div>
            ) : (
              unassigned.map((g) => (
                <label key={g.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <Checkbox
                    checked={!!pickUnassigned[g.id]}
                    onCheckedChange={(v) =>
                      setPickUnassigned((m) => ({ ...m, [g.id]: !!v }))
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium">{g.name}</div>
                    <div className="text-xs text-slate-500">
                      Members: {g.memberCount}
                      {g.leaderName ? ` • Leader: ${g.leaderName}` : ""}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="pt-2">
            <Button
              className="text-[#000D83]"
              size="sm"
              onClick={handleAssign}
              disabled={loadingAssign || selectedUnassignedIds.length === 0}
            >
              Assign selected
            </Button>
          </div>
        </div>

        {/* Assigned column */}
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 text-sm font-medium">
            Assigned to this assignment ({assignment.assignedGroupsCount})
          </div>
          <div className="max-h-64 overflow-auto pr-1 space-y-2">
            {assignedList.length === 0 ? (
              <div className="text-sm text-slate-500 p-2">No groups assigned.</div>
            ) : (
              assignedList.map((g) => (
                <label key={g.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <Checkbox
                    checked={!!pickAssigned[g.id]}
                    onCheckedChange={(v) =>
                      setPickAssigned((m) => ({ ...m, [g.id]: !!v }))
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium">{g.name}</div>
                    <div className="text-xs text-slate-500">
                      Members: {g.memberCount}
                      {g.leaderName ? ` • Leader: ${g.leaderName}` : ""}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleUnassign}
              className="text-[#000D83]"
              disabled={loadingUnassign || selectedAssignedIds.length === 0}
            >
              Unassign selected
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button className="text-violet-800 text-sm btn btn-gradient-slow hover:text-violet-500" variant="outline" onClick={clearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}
