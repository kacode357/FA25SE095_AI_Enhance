"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GroupService } from "@/services/group.services";
import { CreateGroupPayload, UpdateGroupPayload } from "@/types/group/group.payload";
import { GroupDetail } from "@/types/group/group.response";
import { useEffect, useMemo, useState } from "react";

export default function CreateGroupSheet({
  open,
  onOpenChange,
  courseId,
  mode = "create",
  initialData,
  onCreated,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId?: string; // optional in edit mode; fallback to initialData.courseId
  mode?: "create" | "edit";
  initialData?: Partial<GroupDetail>;
  onCreated?: (group: GroupDetail) => void;
  onUpdated?: (group: GroupDetail) => void;
}) {
  // Match CreateGroupPayload shape
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState<number | "">("");
  const [isLocked, setIsLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill when switching to edit mode/opening with initial data
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setMaxMembers(
        typeof initialData.maxMembers === "number" ? initialData.maxMembers : ""
      );
      setIsLocked(!!initialData.isLocked);
      setError(null);
    }
  }, [open, mode, initialData]);

  // Reset form when closing in create mode
  useEffect(() => {
    if (!open && mode === "create") {
      setName("");
      setDescription("");
      setMaxMembers("");
      setIsLocked(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open, mode]);

  const effectiveCourseId = useMemo(
    () => courseId || initialData?.courseId || "",
    [courseId, initialData?.courseId]
  );

  const canSubmit = !!effectiveCourseId && !!name && typeof maxMembers === "number" && maxMembers > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateGroupPayload = {
        courseId: effectiveCourseId,
        name: name.trim(),
        description: description.trim(),
        maxMembers: Number(maxMembers),
        isLocked,
      };

      if (mode === "edit" && initialData?.id) {
        // Include id/groupId in body to avoid mismatch errors
        const updatePayload: UpdateGroupPayload = {
          groupId: initialData.id,
          courseId: payload.courseId,
          name: payload.name,
          description: payload.description,
          maxMembers: payload.maxMembers,
          isLocked: payload.isLocked,
        };
        
        const res = await GroupService.updateGroup(initialData.id, updatePayload);
        if (res?.success) {
          // Prefer group on response if available; otherwise pass through current values
          onUpdated?.((res as any).group || (initialData as GroupDetail));
          onOpenChange(false);
        } else {
          setError((res as any)?.message || "Failed to update group");
        }
      } else {
        const res = await GroupService.create(payload);
        if (res?.success) {
          onCreated?.(res.group);
          // reset form and close
          setName("");
          setDescription("");
          setMaxMembers("");
          setIsLocked(false);
          onOpenChange(false);
        } else {
          setError(res?.message || "Failed to create group");
        }
      }
    } catch (e: any) {
      setError(e?.message || (mode === "edit" ? "Failed to update group" : "Failed to create group"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full bg-white border-l border-slate-200 sm:max-w-xl md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Group" : "Create Group"}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-3">
          {error && (
            <div className="p-2 text-sm text-red-600 border border-red-200 rounded bg-red-50">{error}</div>
          )}
          <div>
            <Label htmlFor="groupName" className="py-2">Group Name</Label>
            <Input id="groupName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lab Team A" disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="groupDescription" className="py-2">Description</Label>
            <Input id="groupDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="maxMembers" className="py-2">Max Members</Label>
            <Input
              id="maxMembers"
              type="number"
              min={1}
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 5"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isLocked"
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              aria-label="Lock group"
              title="Lock group"
              disabled={submitting}
            />
            <Label htmlFor="isLocked">Lock group (prevent changes)</Label>
          </div>
        </div>

        <SheetFooter className="flex flex-row justify-start gap-5">
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save changes" : "Create"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
