// app/lecture/manager/course/[id]/assignments/components/AssignmentDetailView.tsx
"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useExtendDueDate } from "@/hooks/assignment/useExtendDueDate";     // ✅ đã có trong project của mày
import { useCloseAssignment } from "@/hooks/assignment/useCloseAssignment"; // ✅ đã có trong project của mày

import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { normalizeAndSanitizeHtml } from "@/utils/sanitize-html";

import GroupAssignControls from "./GroupAssignControls";
import AssignmentActionsBar from "./AssignmentActionsBar";

type Props = {
  id: string;
  onBack: () => void;
};

const statusColor: Record<AssignmentStatus, string> = {
  0: "bg-slate-200 text-slate-700",     // Draft
  1: "bg-emerald-200 text-emerald-700",  // Active
  2: "bg-blue-200 text-blue-700",        // Extended
  3: "bg-red-200 text-red-700",          // Overdue
  4: "bg-slate-300 text-slate-700",      // Closed
};

const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");

export default function AssignmentDetailView({ id, onBack }: Props) {
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
    <Card className="border-0 shadow-none">
      <CardHeader className="flex items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          {a ? (
            <>
              <span className="truncate">{a.title}</span>
              <Badge className={statusColor[a.status]}>{a.statusDisplay}</Badge>
              {a.isGroupAssignment && <Badge variant="secondary">Group</Badge>}
            </>
          ) : (
            "Assignment Detail"
          )}
        </CardTitle>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-6 space-y-6">
        {loading && (
          <div className="text-sm text-slate-500">Loading assignment...</div>
        )}

        {!loading && !a && (
          <div className="text-sm text-slate-500">Not found or failed to load.</div>
        )}

        {!loading && a && (
          <>
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-500">Course</div>
                <div className="font-medium">{a.courseName}</div>
              </div>
              <div>
                <div className="text-slate-500">Max Points</div>
                <div className="font-medium">{a.maxPoints ?? 0}</div>
              </div>

              <div>
                <div className="text-slate-500">Start</div>
                <div className="font-medium">{fmt(a.startDate)}</div>
              </div>
              <div>
                <div className="text-slate-500">Due</div>
                <div className="font-medium">{fmt(a.dueDate)}</div>
              </div>

              <div>
                <div className="text-slate-500">Extended Due</div>
                <div className="font-medium">{fmt(a.extendedDueDate)}</div>
              </div>
              <div>
                <div className="text-slate-500">Created</div>
                <div className="font-medium">{fmt(a.createdAt)}</div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <div className="text-sm text-slate-500 mb-2">Description</div>
              <ScrollArea className="max-h-64 rounded border p-3">
                <div
                  className="rte-view text-[14px] leading-6"
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              </ScrollArea>

              <style jsx>{`
                .rte-view a { color: #2563eb; text-decoration: underline; }
                .rte-view h1 {
                  font-size: 1.75rem; line-height: 2.25rem; font-weight: 700;
                  margin: 0.5rem 0 0.25rem;
                }
                .rte-view h2 {
                  font-size: 1.5rem; line-height: 2rem; font-weight: 700;
                  margin: 0.5rem 0 0.25rem;
                }
                .rte-view h3 {
                  font-size: 1.25rem; line-height: 1.75rem; font-weight: 600;
                  margin: 0.4rem 0 0.2rem;
                }
                .rte-view p { margin: 0.2rem 0; }
                .rte-view blockquote {
                  border-left: 3px solid #cbd5e1;
                  margin: 0.5rem 0;
                  padding: 0.35rem 0.75rem;
                  color: #475569;
                  background: #f8fafc;
                  border-radius: 0.25rem;
                }
                .rte-view ul, .rte-view ol {
                  list-style-position: outside;
                  padding-left: 1.5rem;
                  margin: 0.35rem 0;
                }
                .rte-view li { display: list-item; margin: 0.125rem 0; }
                .rte-view li::marker { color: #334155; }
                .rte-view img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  display: inline-block;
                }
              `}</style>
            </div>

            {/* Assigned Groups quick view */}
            <div>
              <div className="text-sm text-slate-500 mb-2">
                Assigned Groups ({a.assignedGroupsCount})
              </div>

              {a.assignedGroups && a.assignedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {a.assignedGroups.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-md border bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-slate-500">
                        Members: {g.memberCount}
                        {g.leaderName ? ` • Leader: ${g.leaderName}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No groups assigned.</div>
              )}
            </div>

            {/* Actions: Extend + Close */}
            <AssignmentActionsBar
              assignmentId={a.id}
              status={a.status}
              currentDue={a.dueDate}
              currentExtendedDue={a.extendedDueDate}
              onExtend={handleExtend}
              onClose={handleClose}
            />

            {/* Manage groups (Assign/Unassign) */}
            {a.isGroupAssignment && (
              <>
                <Separator />
                <GroupAssignControls
                  courseId={a.courseId}
                  assignment={{
                    id: a.id,
                    assignedGroupsCount: a.assignedGroupsCount,
                    assignedGroups: a.assignedGroups,
                  }}
                  onChanged={refetchDetail}
                />
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
