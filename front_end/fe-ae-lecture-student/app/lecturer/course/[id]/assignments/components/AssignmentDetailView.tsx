// app/lecture/manager/course/[id]/assignments/components/AssignmentDetailView.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo } from "react";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useCloseAssignment } from "@/hooks/assignment/useCloseAssignment"; // ✅ đã có trong project của mày
import { useExtendDueDate } from "@/hooks/assignment/useExtendDueDate"; // ✅ đã có trong project của mày

import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { normalizeAndSanitizeHtml } from "@/utils/sanitize-html";

import { ArrowLeft, Pencil } from "lucide-react";
import AssignmentActionsBar from "./AssignmentActionsBar";
import GroupAssignControls from "./GroupAssignControls";

type Props = {
  id: string;
  onBack: () => void;
  onEdit?: (id: string) => void; // optional callback to open edit mode
};

const statusColor: Record<AssignmentStatus, string> = {
  // 0: "bg-slate-200 text-slate-700",     // Draft
  1: "bg-emerald-200 text-emerald-700", // Draft
  2: "bg-blue-200 text-blue-700",         // Active
  3: "bg-red-200 text-red-700",          // Extended
  4: "bg-slate-300 text-slate-700",      // Overdue
  5: "bg-slate-200 text-slate-700",      // Closed
};

const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");

export default function AssignmentDetailView({ id, onBack, onEdit }: Props) {
  const { data, loading, fetchAssignment } = useAssignmentById();
  const { extendDueDate, loading: loadingExtend } = useExtendDueDate();
  const { closeAssignment, loading: loadingClose } = useCloseAssignment();

  useEffect(() => {
    if (id) fetchAssignment(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const a = data?.assignment;

  const safeDescription = useMemo(
    () => normalizeAndSanitizeHtml(a?.description),
    [a?.description]
  );

  const refetchDetail = () => {
    if (id) fetchAssignment(id);
  };

  const handleExtend = async (iso: string) => {
    await extendDueDate(id, { extendedDueDate: iso });
    refetchDetail();
  };

  const handleClose = async () => {
    await closeAssignment(id);
    refetchDetail();
  };

  return (
    <Card className="border border-slate-200 py-0 px-2 -gap-2 mr-3.5 shadow-none">
      {/* Header */}
      <CardHeader className="flex items-start justify-between -mx-3 gap-3">
        <div className="min-w-0">
          <CardTitle className="flex mt-3 items-center gap-2 text-lg md:text-xl">
            {a ? (
              <>
                <span className="truncate text-[#000D83]">{a.title}</span>
                <Badge className={statusColor[a.status]}>{a.statusDisplay}</Badge>
                {a.isGroupAssignment && <Badge variant="secondary">Group</Badge>}
              </>
            ) : (
              "Assignment Detail"
            )}
          </CardTitle>

          {a && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              {a.topicName && (
                <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Topic: {a.topicName}</span>
              )}
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Max: {a.maxPoints ?? 0} pts</span>
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Start: {fmt(a.startDate)}</span>
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Due: {fmt(a.dueDate)}</span>
              {a.extendedDueDate && (
                <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Extended: {fmt(a.extendedDueDate)}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex mt-3 items-center gap-2 shrink-0">
          {/* Edit button moved inside detail view (disabled if Closed) */}
          {a && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex items-center gap-1"
              onClick={() => onEdit && onEdit(a.id)}
              disabled={a.status === 5}
              title={a.status === 5 ? "Closed assignments cannot be edited" : "Edit"}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          <Button className="text-[#000D83]" variant="outline" onClick={onBack}><ArrowLeft className="size-4 mr-1" />Back</Button>
        </div>
      </CardHeader>

      <Separator />

  <CardContent className="p-3 min-h-0">
        {loading && (
          <div className="text-sm text-slate-500">Loading assignment...</div>
        )}

        {!loading && !a && (
          <div className="text-sm text-slate-500">Not found or failed to load.</div>
        )}

        {!loading && a && (
          <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:h-[calc(100vh-220px)] min-h-0 overflow-auto">
            {/* Left column: Description and lists */}
            <div className="lg:col-span-8 min-h-0 grid grid-rows-[1fr,auto,auto] gap-6">
              {/* Description */}
              <section className="min-h-0 h-full flex flex-col">
                <div className="mb-2 text-sm text-slate-500">Description</div>
                <ScrollArea className="border border-slate-300 rounded-md bg-white/50 flex-1 min-h-0 h-full w-full overflow-y-auto">
                  <div className="p-4">
                    <div
                      className="rte-view text-[14px] leading-6"
                      dangerouslySetInnerHTML={{ __html: safeDescription }}
                    />
                  </div>
                </ScrollArea>
                <style jsx>{`
                  .rte-view a { color: #2563eb; text-decoration: underline; }
                  .rte-view h1 { font-size: 1.75rem; line-height: 2.25rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
                  .rte-view h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
                  .rte-view h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; margin: 0.4rem 0 0.2rem; }
                  .rte-view p { margin: 0.2rem 0; }
                  .rte-view blockquote { border-left: 3px solid #cbd5e1; margin: 0.5rem 0; padding: 0.35rem 0.75rem; color: #475569; background: #f8fafc; border-radius: 0.25rem; }
                  .rte-view ul, .rte-view ol { list-style-position: outside; padding-left: 1.5rem; margin: 0.35rem 0; }
                  .rte-view li { display: list-item; margin: 0.125rem 0; }
                  .rte-view li::marker { color: #334155; }
                  .rte-view img { max-width: 100%; height: auto; border-radius: 0.5rem; display: inline-block; }
                `}</style>
              </section>

              {/* Assigned Groups quick view */}
              <section>
                <div className="mb-2 text-sm text-slate-500">Assigned Groups ({a.assignedGroupsCount})</div>
                {a.assignedGroups && a.assignedGroups.length > 0 ? (
                  <ScrollArea className="max-h-72">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {a.assignedGroups.map((g) => (
                        <div key={g.id} className="px-3 py-2 text-sm border border-violet-400 rounded-md bg-slate-50">
                          <div className="font-medium">{g.name}</div>
                          <div className="text-xs text-slate-500">
                            Members: {g.memberCount}
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

              {/* Manage Groups controls directly under Assigned Groups */}
              {a.isGroupAssignment && (
                <section className="mt-0">
                  <GroupAssignControls
                    courseId={a.courseId}
                    assignment={{
                      id: a.id,
                      assignedGroupsCount: a.assignedGroupsCount,
                      assignedGroups: a.assignedGroups,
                    }}
                    onChanged={refetchDetail}
                  />
                </section>
              )}

              {/* End manage groups */}
            </div>

            {/* Right column: Overview + Actions */}
            <div className="lg:col-span-4 space-y-5">
              {/* Overview */}
              <section className="rounded-md border mt-6.5 border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-300 text-sm text-[#000D83] font-medium">Overview</div>
                <div className="px-4 py-3 text-sm grid grid-cols-1 gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500">Course</span>
                    <span className="font-medium text-right">{a.courseName}</span>
                  </div>
                  {a.topicName && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500">Topic</span>
                      <span className="font-medium text-right">{a.topicName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium">{a.isGroupAssignment ? "Group" : "Individual"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Max Points</span>
                    <span className="font-medium">{a.maxPoints ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Start</span>
                    <span className="font-medium">{fmt(a.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Due</span>
                    <span className="font-medium">{fmt(a.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Extended Due</span>
                    <span className="font-medium">{fmt(a.extendedDueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Created</span>
                    <span className="font-medium">{fmt(a.createdAt)}</span>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <section className="rounded-md border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-300 text-sm text-[#000D83] font-medium">Due Date</div>
                <div className="px-4 py-3">
                  <AssignmentActionsBar
                    assignmentId={a.id}
                    status={a.status}
                    currentDue={a.dueDate}
                    currentExtendedDue={a.extendedDueDate}
                    onExtend={handleExtend}
                    onClose={handleClose}
                  />
                </div>
              </section>
            </div>
          </div>
          {/* Group assignment controls are displayed under Assigned Groups in the left column */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
