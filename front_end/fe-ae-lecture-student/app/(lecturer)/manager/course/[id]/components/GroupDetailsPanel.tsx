"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GroupDetail } from "@/types/group/group.response";
import { useMemo } from "react";

export default function GroupDetailsPanel({
  group,
  onClose,
}: {
  group: GroupDetail;
  onClose: () => void;
}) {
  const createdAt = useMemo(() => new Date(group.createdAt).toLocaleString(), [group.createdAt]);

  return (
    <Card className="w-full sm:max-w-xl md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Group details</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-xs">ID</Label>
            <div className="text-xs break-words">{group.id}</div>
          </div>

          <div>
            <Label className="text-xs">Course</Label>
            <div className="text-xs">{group.courseName} ({group.courseId})</div>
          </div>

          <div>
            <Label className="text-xs">Name</Label>
            <div className="text-xs">{group.name}</div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <div className="text-xs">{group.description || "—"}</div>
          </div>

          <div>
            <Label className="text-xs">Max members</Label>
            <div className="text-xs">{group.maxMembers}</div>
          </div>

          <div>
            <Label className="text-xs">Members</Label>
            <div className="text-xs">{group.memberCount}</div>
          </div>

          <div>
            <Label className="text-xs">Leader</Label>
            <div className="text-xs">{group.leaderName || "—"} ({group.leaderId || "—"})</div>
          </div>

          <div>
            <Label className="text-xs">Assignment</Label>
            <div className="text-xs">{group.assignmentTitle || "—"} ({group.assignmentId || "—"})</div>
          </div>

          <div>
            <Label className="text-xs">Locked</Label>
            <div className="text-xs">{group.isLocked ? "Yes" : "No"}</div>
          </div>

          <div>
            <Label className="text-xs">Created by</Label>
            <div className="text-xs">{group.createdBy}</div>
          </div>

          <div>
            <Label className="text-xs">Created at</Label>
            <div className="text-xs">{createdAt}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
