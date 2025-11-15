// app/lecturer/course/[id]/assignments/components/AssignmentDetailView.tsx
"use client";

import { ArrowLeft, CalendarCheck2, ChevronDown, ChevronRight, Info, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useCloseAssignment } from "@/hooks/assignment/useCloseAssignment";
import { useExtendDueDate } from "@/hooks/assignment/useExtendDueDate";
import { useScheduleAssignment } from "@/hooks/assignment/useScheduleAssignment";

import { AssignmentStatus } from "@/types/assignments/assignment.response";

import AssignmentActionsBar from "./AssignmentActionsBar";
import ConfirmScheduleAssignmentDialog from "./ConfirmScheduleAssignmentDialog";
import GroupAssignControls from "./GroupAssignControls";

// dùng TinyMCE viewer (đã có sẵn trong project)
import LiteRichTextEditor from "@/components/common/TinyMCE";

type Props = {
  id: string;
  onBack: () => void;
  onEdit?: (id: string) => void;
};

const statusColor: Record<AssignmentStatus, string> = {
  1: "bg-slate-200 text-slate-800",
  2: "bg-emerald-200 text-emerald-800",
  3: "bg-blue-200 text-blue-800",
  4: "bg-amber-200 text-amber-800",
  5: "bg-red-200 text-red-800",
  6: "bg-slate-500 text-white",
  7: "bg-purple-200 text-purple-800",
};

const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");

const daysUntilDue = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    const ms = new Date(iso).getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (days > 1) return `${days} days`;
    if (days === 1) return `1 day`;
    if (days === 0) return `0`;
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""}`;
  } catch (e) {
    return "—";
  }
};

export default function AssignmentDetailView({ id, onBack, onEdit }: Props) {
  const { data, loading, fetchAssignment } = useAssignmentById();
  const { extendDueDate, loading: loadingExtend } = useExtendDueDate();
  const { closeAssignment, loading: loadingClose } = useCloseAssignment();
  const { scheduleAssignment, loading: loadingSchedule } = useScheduleAssignment();

  const [openOverview, setOpenOverview] = useState(false);
  const [openScheduleConfirm, setOpenScheduleConfirm] = useState(false);
  const [overviewEnter, setOverviewEnter] = useState(false);
  const [overviewMounted, setOverviewMounted] = useState(false);

  useEffect(() => {
    if (id) fetchAssignment(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const a = data?.assignment;

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

  const handleSchedule = async () => {
    await scheduleAssignment(id, { schedule: true });
    setOpenScheduleConfirm(false);
    refetchDetail();
  };

  // trigger a small enter animation when overview opens, and keep it mounted during exit
  useEffect(() => {
    let t: number | undefined;
    if (openOverview) {
      setOverviewMounted(true);
      setOverviewEnter(false);
      // schedule in next frame so transition runs
      requestAnimationFrame(() => setOverviewEnter(true));
    } else {
      // start exit animation
      setOverviewEnter(false);
      // keep mounted until animation finishes (match duration 500ms)
      t = window.setTimeout(() => setOverviewMounted(false), 500);
    }
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [openOverview]);

  return (
    <Card className="border border-slate-200 py-0 px-2 -gap-2 mr-3.5 shadow-none">
      {/* ===== Header ===== */}
      <CardHeader className="flex items-start justify-between -mx-3 gap-3">
        <div className="min-w-0">
          <CardTitle className="flex mt-3 items-center gap-2 text-lg md:text-xl">
            {a ? (
              <>
                <span className="truncate text-[#000D83]">{a.title}</span>
                <Badge className={`${statusColor[a.status]} shadow-md`}>{a.statusDisplay}</Badge>
                {a.isGroupAssignment && <Badge variant="secondary">Group</Badge>}
              </>
            ) : (
              "Assignment Detail"
            )}
          </CardTitle>

          {a && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              {a.topicName && (
                <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
                  Topic: {a.topicName}
                </span>
              )}
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
                Max: {a.maxPoints ?? 0} pts
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
                Start: {fmt(a.startDate)}
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
                Due: {fmt(a.dueDate)}
              </span>
              {a.extendedDueDate && (
                <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
                  Extended: {fmt(a.extendedDueDate)}
                </span>
              )}
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
                Days until due: {daysUntilDue(a.extendedDueDate ?? a.dueDate)}
              </span>
            </div>
          )}
        </div>

        <div className="flex mt-3 items-center gap-2 shrink-0">
          {a && a.status === AssignmentStatus.Draft && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex btn btn-gradient-slow mr-3 items-center gap-1"
              onClick={() => setOpenScheduleConfirm(true)}
              disabled={loadingSchedule}
              title="Schedule this assignment"
            >
              <CalendarCheck2 className="h-3.5 w-3.5" /> Schedule
            </Button>
          )}
          {a && a.status !== AssignmentStatus.Overdue && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex btn btn-gradient-slow items-center gap-1"
              onClick={() => onEdit && onEdit(a.id)}
              disabled={a.status === AssignmentStatus.Closed}
              title={a.status === AssignmentStatus.Closed ? "Closed assignments cannot be edited" : "Edit"}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          <Button className="text-[#000D83]" variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      </CardHeader>

      <Separator />

      {/* ===== Content ===== */}
      <CardContent className="p-3 min-h-0">
        {loading && <div className="text-sm text-slate-500">Loading assignment...</div>}

        {!loading && !a && (
          <div className="text-sm text-slate-500">Not found or failed to load.</div>
        )}

        {!loading && a && (
          <>
            {/* Confirm schedule modal */}
            <ConfirmScheduleAssignmentDialog
              open={openScheduleConfirm}
              onOpenChange={setOpenScheduleConfirm}
              submitting={loadingSchedule}
              info={{
                title: a.title,
                start: a.startDate,
                due: a.dueDate,
                statusDisplay: a.statusDisplay,
              }}
              onConfirm={handleSchedule}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:h-[calc(100vh-220px)] min-h-0 overflow-auto">
              {/* ===== Left column ===== */}
              <div
                className={`${overviewMounted ? "lg:col-span-8" : "lg:col-span-12"} min-h-0 grid grid-rows-[1fr,auto,auto] lg:grid-rows-[4fr,auto,auto] gap-6 relative`}
              >
                {/* Overview toggle (when collapsed) */}
                {!openOverview && (
                  <div className="absolute top-0 right-0 -mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-8 px-2"
                      onClick={() => setOpenOverview(true)}
                    >
                      <span className="flex items-center gap-1 text-[#000D83]">
                        <Info className="size-4" />
                        <ChevronRight className="size-4" />
                        Overview
                      </span>
                    </Button>
                  </div>
                )}

                {/* ===== Description (TinyMCE read-only) ===== */}
                <section className="min-h-0 h-full flex flex-col lg:min-h-[65vh]">
                  <div className="mb-2 text-sm text-slate-500">Description</div>
                  <ScrollArea className="border border-slate-300 rounded-md bg-white/50 flex-1 min-h-0 w-full overflow-y-auto">
                    <div className="p-2">
                      <LiteRichTextEditor
                        value={a.description ?? ""}
                        onChange={() => { }}
                        readOnly
                        className="rounded-md"
                        debounceMs={200}
                        placeholder="No description..."
                      />
                    </div>
                  </ScrollArea>
                </section>

                {/* ===== Assigned Groups quick view ===== */}
                <section>
                  <div className="mb-2 text-sm text-slate-500">
                    Assigned Groups ({a.assignedGroupsCount})
                  </div>
                  {a.assignedGroups && a.assignedGroups.length > 0 ? (
                    <ScrollArea className="max-h-72">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {a.assignedGroups.map((g) => (
                          <div
                            key={g.id}
                            className="px-3 py-2 text-sm border border-violet-400 rounded-md bg-slate-50"
                          >
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

                {/* ===== Manage Groups controls ===== */}
                {a.isGroupAssignment && (
                  <section className="mt-0">
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
              </div>

              {/* ===== Right column (Overview) ===== */}
              {overviewMounted && (
                <div className="lg:col-span-4">
                  <div className={`rounded-md border mt-6.5 border-slate-200 bg-white overflow-hidden transition-all duration-300`}>
                    <div className="py-3 border-b border-slate-300 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-8 px-2"
                        onClick={() => setOpenOverview((s) => !s)}
                      >
                        <span className="flex items-center gap-1 text-[#000D83]">
                          <Info className="size-4" />
                          <ChevronDown className="size-4" />
                          Overview
                        </span>
                      </Button>
                    </div>

                    <div className={`px-4 py-3 text-sm grid grid-cols-1 gap-5 transition-all duration-500 ease-out transform ${overviewEnter ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
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
                        <span className="text-slate-500">Format</span>
                        <span className="font-medium">{a.format?.trim() || "—"}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Grading Criteria</span>
                        <span className="font-medium">{a.gradingCriteria?.trim() || "—"}</span>
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

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Updated</span>
                        <span className="font-medium">{fmt(a.updatedAt)}</span>
                      </div>

                      {/* Due Date actions */}
                      <div className="mt-2">
                        <AssignmentActionsBar
                          assignmentId={a.id}
                          status={a.status}
                          currentDue={a.dueDate}
                          currentExtendedDue={a.extendedDueDate}
                          onExtend={handleExtend}
                          onClose={handleClose}
                          defaultOpen
                          loadingExtend={loadingExtend}
                          loadingClose={loadingClose}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
