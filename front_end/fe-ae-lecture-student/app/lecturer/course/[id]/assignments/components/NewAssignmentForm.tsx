// app/lecturer/course/[id]/assignments/components/NewAssignmentForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

import { DateTimePicker } from "@/components/ui/date-time-picker";
import LiteRichTextEditor from "@/components/common/TinyMCE";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { courseAxiosInstance } from "@/config/axios.config";
import { useAssignGroups } from "@/hooks/assignment/useAssignGroups";
import { useCreateAssignment } from "@/hooks/assignment/useCreateAssignment";
import { useScheduleAssignment } from "@/hooks/assignment/useScheduleAssignment";
import { useUnassignedGroups } from "@/hooks/assignment/useUnassignedGroups";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { useGetTopicsDropdown } from "@/hooks/topic/useGetTopicsDropdown";
import { AssignmentService } from "@/services/assignment.services";
import type { CreateAssignmentPayload } from "@/types/assignments/assignment.payload";

function normalizeHtmlForSave(input?: string | null): string {
  if (!input) return "";
  let html = input;
  html = html.replace(/<p>\s*(<(?:ol|ul)[\s\S]*?<\/(?:ol|ul)>)\s*<\/p>/gi, "$1");
  html = html.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");
  html = html.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, "");
  html = html.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br>");
  html = html.replace(/^\s*<div[^>]*>([\s\S]*?)<\/div>\s*$/i, "$1");
  return html.trim();
}

type Props = {
  courseId: string;
  onCreated?: () => void;
  onCancel?: () => void;
};

export default function NewAssignmentForm({ courseId, onCreated, onCancel }: Props) {
  const { createAssignment, loading: creating } = useCreateAssignment();
  const { scheduleAssignment, loading: scheduling } = useScheduleAssignment();
  const { assignGroups, loading: assigning } = useAssignGroups();
  const { data: topics, loading: loadingTopics, fetchDropdown } = useGetTopicsDropdown();
  const { listData: courseGroups, loading: loadingGroups, fetchByCourseId } = useGroupsByCourseId();
  const { data: unassignedData, loading: loadingUnassigned, fetchUnassignedGroups } = useUnassignedGroups();

  const [assignmentLookup, setAssignmentLookup] = useState<Record<string, any>>({});
  const [loadingLookup, setLoadingLookup] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topicId: "",
    description: "",
    startDate: "",
    dueDate: "",
    isGroupAssignment: false,
    autoSchedule: true,
    maxPoints: "",
    groupIds: [] as string[],
    format: "",
    gradingCriteria: "",
  });

  const [createdAssignmentId, setCreatedAssignmentId] = useState<string | null>(null);
  const [createdAssignment, setCreatedAssignment] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const checkboxSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (courseId) fetchByCourseId(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchUnassignedGroups(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    fetchDropdown();
  }, []);

  const selectedGroupSet = useMemo(() => new Set(form.groupIds), [form.groupIds]);

  const toggleGroup = (gid: string, checked: boolean | string) => {
    setForm((prev) => {
      const next = new Set(prev.groupIds);
      if (checked) next.add(gid);
      else next.delete(gid);
      return { ...prev, groupIds: Array.from(next) };
    });
  };

  // Build a lookup of assigned groups -> their current assignment (if any)
  useEffect(() => {
    async function fetchLookups() {
      const groups = courseGroups ?? [];
      const unassigned = new Set((unassignedData?.unassignedGroups || []).map((g) => g.id));
      const assigned = groups.filter((g) => !unassigned.has(g.id));
      if (assigned.length === 0) {
        setAssignmentLookup({});
        return;
      }

      setLoadingLookup(true);
      try {
        const pairs = await Promise.all(
          assigned.map(async (g) => {
            try {
              const res = await AssignmentService.getAssignmentByGroupId(g.id);
              return [g.id, res.assignment] as const;
            } catch {
              return [g.id, null] as const;
            }
          })
        );
        const map: Record<string, any> = {};
        for (const [gid, assignment] of pairs) map[gid] = assignment;
        setAssignmentLookup(map);
      } finally {
        setLoadingLookup(false);
      }
    }

    if ((courseGroups ?? []).length > 0) fetchLookups();
  }, [courseGroups, unassignedData]);

  const resetForm = () =>
    setForm({
      title: "",
      topicId: "",
      description: "",
      startDate: "",
      dueDate: "",
      isGroupAssignment: false,
      autoSchedule: true,
      maxPoints: "",
      groupIds: [],
      format: "",
      gradingCriteria: "",
    });

  async function uploadImageToServer(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await courseAxiosInstance.post<{ url: string }>("/Uploads", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  }

  const onSubmit = async () => {
    if (!courseId) return;
    if (!form.title.trim()) return alert("Title is required");
    if (!form.startDate || !form.dueDate) return alert("Dates are required");

    const nowMs = Date.now();
    const startMs = new Date(form.startDate).getTime();
    if (startMs < nowMs + 5 * 60 * 1000) {
      return toast.warning("Start Date/Time must be at least 5 minutes from now");
    }

    // Due date must be at least the next calendar day after start date (ignore time)
    const start = new Date(form.startDate);
    const due = new Date(form.dueDate);
    const startDayUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const dueDayUtc = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (dueDayUtc < startDayUtc + oneDayMs) {
      return alert("Due Date must be at least the next calendar day after Start Date");
    }

    const descriptionClean = normalizeHtmlForSave(form.description);

    const payload: CreateAssignmentPayload = {
      courseId,
      title: form.title.trim(),
      topicId: form.topicId.trim(),
      description: descriptionClean || undefined,
      startDate: new Date(form.startDate).toISOString(),
      dueDate: new Date(form.dueDate).toISOString(),
      isGroupAssignment: !!form.isGroupAssignment,
      maxPoints: form.maxPoints ? Number(form.maxPoints) : undefined,
      format: form.format?.trim() || undefined,
      gradingCriteria: form.gradingCriteria?.trim() || undefined,
      groupIds: form.isGroupAssignment && form.groupIds.length > 0 ? form.groupIds : undefined,
    };

    const res = await createAssignment(payload);
    if (res?.success) {
      setCreatedAssignmentId(res.assignmentId);
      setCreatedAssignment(res.assignment ?? null);

      if (form.autoSchedule) {
        try {
          await scheduleAssignment(res.assignmentId, { schedule: true });
        } catch {
          // schedule hook đã toast lỗi rồi
        }
      }

      setTimeout(
        () => checkboxSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );

      toast.success("Assignment created. You can now assign groups (if needed).");
      // Không reset form để user chọn groups
    }
  };

  return (
    <Card className="border-slate-200 py-0 pt-4 shadow-sm">
      <CardContent className="space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-1">Title *</Label>
            <Input
              placeholder="Homework 1"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="text-xs"
            />
          </div>

          <div>
            <Label className="text-sm mb-1">Topic</Label>
            {loadingTopics ? (
              <div className="text-sm text-slate-500 p-2">Loading topics...</div>
            ) : (topics?.length ?? 0) === 0 ? (
              <div className="text-sm text-slate-500 p-2">No topics available.</div>
            ) : (
              <select
                title="Topic"
                className="w-full border text-xs border-slate-200 bg-white placeholder:text-xs rounded-lg px-2 py-3"
                value={form.topicId}
                onChange={(e) => setForm((p) => ({ ...p, topicId: e.target.value }))}
              >
                <option value="">Select a topic</option>
                {topics?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm block mb-1">Description (rich text)</Label>
          <LiteRichTextEditor
            className="w-full"
            value={form.description}
            onChange={(html) => setForm((p) => ({ ...p, description: html }))}
            placeholder="Exercise description…"
            // onImageUpload={uploadImageToServer}
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-1">Max Points</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="100"
              value={form.maxPoints}
              className="text-xs"
              onChange={(e) =>
                setForm((p) => ({ ...p, maxPoints: e.target.value.replace(/\D/g, "") }))
              }
            />
          </div>

          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <Label className="text-sm mb-1">Start Date *</Label>
              <DateTimePicker
                className="placeholder:text-slate-100 border-slate-100"
                value={form.startDate}
                onChange={(iso: string) => setForm((p) => ({ ...p, startDate: iso }))}
                placeholder="yyyy-MM-dd HH:mm"
                minDate={new Date()}
                minTime={new Date(Date.now() + 5 * 60 * 1000)}
                timeIntervals={5}
              />
            </div>

            <div className="flex-1">
              <Label className="text-sm mb-1">Due Date *</Label>
              <DateTimePicker
                value={form.dueDate}
                onChange={(iso: string) => setForm((p) => ({ ...p, dueDate: iso }))}
                placeholder="yyyy-MM-dd HH:mm"
                minDate={
                  form.startDate
                    ? (() => {
                        const s = new Date(form.startDate);
                        return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 1);
                      })()
                    : new Date()
                }
                timeIntervals={5}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm mb-1">Format</Label>
            <Input
              placeholder="PDF, ZIP, ... (optional)"
              value={form.format}
              className="text-xs"
              onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-sm flex items-center gap-1 mb-1">
              Grading Criteria
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Grading criteria help"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full cursor-pointer bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                  >
                    <CircleAlert className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-white text-slate-500">
                  The assessment criteria used to determine the score.
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              placeholder="Rubric note (optional)"
              value={form.gradingCriteria}
              className="text-xs"
              onChange={(e) => setForm((p) => ({ ...p, gradingCriteria: e.target.value }))}
            />
          </div>
        </div>

        <Separator />

        {/* Group assignment */}
        <div>
          <div ref={checkboxSectionRef} className="space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div className="flex gap-2 items-center">
                <Checkbox
                  id="isGroup"
                  checked={form.isGroupAssignment}
                  onCheckedChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      isGroupAssignment: !!v,
                      groupIds: !!v ? p.groupIds : [],
                    }))
                  }
                />
                <Label htmlFor="isGroup" className="cursor-pointer">
                  This is a group assignment
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="autoSchedule"
                    checked={form.autoSchedule}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, autoSchedule: !!v }))}
                    className="border-slate-400 text-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label htmlFor="autoSchedule" className="cursor-pointer">
                    Automatically schedule this Assignment
                  </Label>
                </div>
              </div>
            </div>

            {form.isGroupAssignment && createdAssignmentId && (
              <div className="rounded-lg border border-slate-300 p-3">
                <div className="mb-2 text-sm font-medium">Select groups in this course</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-60 overflow-auto pr-1">
                  {loadingGroups || loadingUnassigned ? (
                    <div className="text-sm text-slate-500 p-2">Loading groups...</div>
                  ) : (courseGroups?.length ?? 0) === 0 ? (
                    <div className="text-sm text-slate-500 p-2">No groups in this course.</div>
                  ) : (
                    (courseGroups ?? []).map((g) => {
                      const unassignedIds = new Set(
                        (unassignedData?.unassignedGroups || []).map((u) => u.id)
                      );
                      const isAssigned = !unassignedIds.has(g.id);
                      const assignedInfo = assignmentLookup[g.id];

                      return (
                        <label
                          key={g.id}
                          className={`flex border-slate-300 items-center gap-2 rounded-md border px-3 py-2 ${
                            isAssigned ? "opacity-70" : ""
                          }`}
                        >
                          <Checkbox
                            checked={selectedGroupSet.has(g.id)}
                            onCheckedChange={(v) => toggleGroup(g.id, v)}
                            disabled={isAssigned}
                            className="cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="text-sm cursor-text font-medium">{g.name}</div>
                            <div className="text-xs text-slate-500 cursor-text">
                              Members: {g.memberCount}
                              {g.leaderName ? ` • Leader: ${g.leaderName}` : ""}
                            </div>
                            {isAssigned && (
                              <div className="text-xs cursor-text text-amber-700 mt-1">
                                {loadingLookup ? (
                                  "Checking assignment..."
                                ) : assignedInfo ? (
                                  <>
                                    Assignment:{" "}
                                    <span className="cursor-text font-medium">
                                      {assignedInfo.title ??
                                        assignedInfo.name ??
                                        "Unnamed"}
                                    </span>
                                  </>
                                ) : (
                                  "Assigned"
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {createdAssignmentId && form.isGroupAssignment && (
              <div className="flex items-center justify-end gap-3 mt-3">
                <Button
                  variant="outline"
                  className="text-violet-800"
                  onClick={() => {
                    toast.success("Returning to assignments...");
                    onCreated?.();
                  }}
                >
                  Back
                </Button>
                <Button
                  className="btn text-sm btn-gradient-slow"
                  onClick={async () => {
                    if (!createdAssignmentId) {
                      return toast.error("No assignment available to assign groups.");
                    }
                    if ((form.groupIds?.length ?? 0) === 0) {
                      toast.success("No groups selected. Returning to assignments.");
                      onCreated?.();
                      return;
                    }
                    try {
                      await assignGroups({
                        assignmentId: createdAssignmentId,
                        groupIds: form.groupIds,
                      });
                      onCreated?.();
                    } catch {
                      toast.error("Failed to assign groups.");
                    }
                  }}
                  disabled={assigning}
                >
                  Assign Group
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center rounded-xl justify-end gap-2 bg-white py-3">
        {!createdAssignmentId && onCancel && (
          <Button
            className="text-violet-800 hover:text-violet-500"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}

        {!createdAssignmentId && (
          <Button
            className="btn btn-gradient-slow"
            onClick={onSubmit}
            disabled={creating || scheduling || assigning}
          >
            Create
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
