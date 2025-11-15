// app/lecture/manager/course/[id]/assignments/components/NewAssignmentForm.tsx
"use client";

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
import { CircleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
            } catch (err) {
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

    // only run when courseGroups or unassignedData changes
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
      groupIds:
        form.isGroupAssignment && form.groupIds.length > 0 ? form.groupIds : undefined,
    };

    const res = await createAssignment(payload);
    if (res?.success) {
      const createdHasAssignedGroups = !!res.assignment?.assignedGroups && res.assignment.assignedGroups.length > 0;
      if (form.isGroupAssignment && form.groupIds.length > 0 && !createdHasAssignedGroups) {
        try {
          await assignGroups({ assignmentId: res.assignmentId, groupIds: form.groupIds });
        } catch (err) {
          // assignGroups hook toasts on success/failure; continue flow regardless
        }
      }
      // If user wants automatic scheduling, call schedule hook
      if (form.autoSchedule) {
        try {
          await scheduleAssignment(res.assignmentId, { schedule: true });
        } catch (err) {
          // schedule hook already toasts on error; continue
        }
      }

      resetForm();
      onCreated?.();
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
            <Label className="text-sm mb-1">Max Points</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="100"
              value={form.maxPoints}
              className="text-xs"
              onChange={(e) => setForm((p) => ({ ...p, maxPoints: e.target.value }))}
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

          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <Label className="text-sm mb-1">Start Date *</Label>
              <Input
                type="datetime-local"
                value={form.startDate}
                className="text-xs"
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>

            <div className="flex-1">
              <Label className="text-sm mb-1">Due Date *</Label>
              <Input
                type="datetime-local"
                className="text-xs"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
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
          // onImageUpload={uploadImageToServer} // bật nếu editor hỗ trợ
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="">
          <div className="space-y-3">
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
              {/* Automatically schedule */}
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

            {form.isGroupAssignment && (
              <div className="rounded-lg border border-slate-300 p-3">
                <div className="mb-2 text-sm font-medium">Select groups in this course</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-60 overflow-auto pr-1">
                  {loadingGroups || loadingUnassigned ? (
                    <div className="text-sm text-slate-500 p-2">Loading groups...</div>
                  ) : (courseGroups?.length ?? 0) === 0 ? (
                    <div className="text-sm text-slate-500 p-2">No groups in this course.</div>
                  ) : (
                    (courseGroups ?? []).map((g) => {
                      const unassignedIds = new Set((unassignedData?.unassignedGroups || []).map((u) => u.id));
                      const isAssigned = !unassignedIds.has(g.id);
                      const assignedInfo = assignmentLookup[g.id];

                      return (
                        <label
                          key={g.id}
                          className={`flex border-slate-300 items-center gap-2 rounded-md border px-3 py-2 ${isAssigned ? "opacity-70" : ""}`}
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
                                    Assignment: <span className="cursor-text font-medium">{assignedInfo.title ?? assignedInfo.name ?? "Unnamed"}</span>
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
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center rounded-xl justify-end gap-2 bg-white py-3">
        {onCancel && (
          <Button className="text-violet-800 hover:text-violet-500" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button className="btn btn-gradient-slow" onClick={onSubmit} disabled={creating || scheduling || assigning}>
          Create
        </Button>
      </CardFooter>
    </Card>
  );
}
