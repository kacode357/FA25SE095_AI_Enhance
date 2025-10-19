// app/lecture/manager/course/[id]/assignments/components/NewAssignmentForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import LiteRichTextEditor from "@/components/common/LiteRichTextEditor";
import { useCreateAssignment } from "@/hooks/assignment/useCreateAssignment";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import type { CreateAssignmentPayload } from "@/types/assignments/assignment.payload";
import { courseAxiosInstance } from "@/config/axios.config";

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
  const { createAssignment, loading } = useCreateAssignment();
  const { listData: courseGroups, loading: loadingGroups, fetchByCourseId } = useGroupsByCourseId();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    isGroupAssignment: false,
    maxPoints: "",
    groupIds: [] as string[],
    format: "",
    gradingCriteria: "",
  });

  useEffect(() => {
    if (courseId) fetchByCourseId(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const selectedGroupSet = useMemo(() => new Set(form.groupIds), [form.groupIds]);

  const toggleGroup = (gid: string, checked: boolean | string) => {
    setForm((prev) => {
      const next = new Set(prev.groupIds);
      if (checked) next.add(gid);
      else next.delete(gid);
      return { ...prev, groupIds: Array.from(next) };
    });
  };

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      startDate: "",
      dueDate: "",
      isGroupAssignment: false,
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
      resetForm();
      onCreated?.();
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Title *</Label>
          <Input
            placeholder="Homework 1"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>

        <div>
          <Label className="text-sm">Max Points</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="100"
            value={form.maxPoints}
            onChange={(e) => setForm((p) => ({ ...p, maxPoints: e.target.value }))}
          />
        </div>

        <div>
          <Label className="text-sm">Start Date *</Label>
          <Input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
          />
        </div>

        <div>
          <Label className="text-sm">Due Date *</Label>
          <Input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-sm block mb-1">Description (rich text)</Label>
          <LiteRichTextEditor
            className="w-full"
            value={form.description}
            onChange={(html) => setForm((p) => ({ ...p, description: html }))}
            placeholder="Mô tả bài tập…"
            // onImageUpload={uploadImageToServer} // bật nếu editor hỗ trợ
          />
        </div>

        <div>
          <Label className="text-sm">Format</Label>
          <Input
            placeholder="PDF, ZIP, ... (optional)"
            value={form.format}
            onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}
          />
        </div>

        <div>
          <Label className="text-sm">Grading Criteria</Label>
          <Input
            placeholder="Rubric note (optional)"
            value={form.gradingCriteria}
            onChange={(e) => setForm((p) => ({ ...p, gradingCriteria: e.target.value }))}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
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

        {form.isGroupAssignment && (
          <div className="rounded-lg border p-3">
            <div className="mb-2 text-sm font-medium">Select groups in this course</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-auto pr-1">
              {loadingGroups ? (
                <div className="text-sm text-slate-500 p-2">Loading groups...</div>
              ) : (courseGroups?.length ?? 0) === 0 ? (
                <div className="text-sm text-slate-500 p-2">No groups in this course.</div>
              ) : (
                (courseGroups ?? []).map((g) => (
                  <label key={g.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Checkbox
                      checked={selectedGroupSet.has(g.id)}
                      onCheckedChange={(v) => toggleGroup(g.id, v)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{g.name}</div>
                      <div className="text-xs text-slate-500">
                        Members: {g.memberCount}
                        {g.leaderName ? ` • Leader: ${g.leaderName}` : ""}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
        )}
        <Button onClick={onSubmit} disabled={loading}>
          Create
        </Button>
      </div>
    </div>
  );
}
