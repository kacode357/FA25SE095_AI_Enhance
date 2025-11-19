"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateGroup } from "@/hooks/group/useCreateGroup";
import { useUpdateGroup } from "@/hooks/group/useUpdateGroup";
import { CreateGroupPayload, UpdateGroupPayload } from "@/types/group/group.payload";
import { GroupDetail } from "@/types/group/group.response";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  // we show validation messages via toast instead of inline errors

  const { createGroup } = useCreateGroup();
  const { updateGroup } = useUpdateGroup();

  // Prefill when switching to edit mode/opening with initial data
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setMaxMembers(
        typeof initialData.maxMembers === "number" ? initialData.maxMembers : ""
      );
      setIsLocked(!!initialData.isLocked);
    }
  }, [open, mode, initialData]);

  // Reset form when closing in create mode
  useEffect(() => {
    if (!open && mode === "create") {
      setName("");
      setDescription("");
      setMaxMembers("");
      setIsLocked(false);
      setSubmitting(false);
    }
  }, [open, mode]);

  const effectiveCourseId = useMemo(
    () => courseId || initialData?.courseId || "",
    [courseId, initialData?.courseId]
  );

  const canSubmit = !!effectiveCourseId && !!name && typeof maxMembers === "number" && maxMembers > 0;

  const handleSubmit = async () => {
    if (submitting) return;

    const validationErrors: string[] = [];
    if (!effectiveCourseId) validationErrors.push("Course is required");
    if (!name || name.trim() === "") validationErrors.push("Group name is required");
    if (typeof maxMembers !== "number" || maxMembers <= 0) validationErrors.push("Max members is required and must be greater than 0");

    if (validationErrors.length > 0) {
      // show single toast with all validation messages to avoid stacked toasts hiding each other
      toast.error(validationErrors.join(" — "));
      return;
    }

    setSubmitting(true);
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
        const res = await updateGroup(updatePayload);
        if (res) {
          if (res.success) {
            toast.success(res.message || "Group updated");
            // response may return an array of groups or a single group
            let updatedGroup: GroupDetail | undefined;
            if (res.group) {
              // @ts-ignore - group can be GroupDetail | GroupDetail[] depending on API
              if (Array.isArray(res.group)) {
                // try to find by id, fallback to first
                // @ts-ignore
                updatedGroup = (res.group as GroupDetail[]).find((g) => g.id === updatePayload.groupId) || (res.group as GroupDetail[])[0];
              } else {
                // @ts-ignore
                updatedGroup = res.group as GroupDetail;
              }
            }
            if (updatedGroup) {
              onUpdated?.(updatedGroup);
            } else {
              onUpdated?.(initialData as GroupDetail);
            }
            onOpenChange(false);
          } else {
            // show backend message in toast instead of top-level error box
            toast.error(res.message || "Failed to update group");
          }
        } else {
          toast.error("Failed to update group");
        }
      } else {
        const res = await createGroup(payload);
        if (res) {
          if (res.success) {
            toast.success(res.message || "Group created");
            // handle either array or single
            // @ts-ignore
            const created = Array.isArray(res.group) ? (res.group as GroupDetail[])[0] : (res.group as GroupDetail);
            if (created) onCreated?.(created as GroupDetail);
            // reset form and close
            setName("");
            setDescription("");
            setMaxMembers("");
            setIsLocked(false);
            onOpenChange(false);
          } else {
            toast.error(res.message || "Failed to create group");
          }
        } else {
          toast.error("Failed to create group");
        }
      }
    } catch (e: any) {
      toast.error(e?.message || (mode === "edit" ? "Failed to update group" : "Failed to create group"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full bg-white border-l border-slate-200 sm:max-w-xl md:max-w-xl">
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Group" : "Create Group"}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-3">
          {/* top-level server errors are shown as toasts; keep field-level inline errors */}
          <div>
            <Label htmlFor="groupName" className="py-2">Group Name</Label>
            <Input
              id="groupName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="e.g. Lab Team A"
              disabled={submitting}
            />
            {/* field-level errors are shown as toasts */}
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
              onChange={(e) => {
                setMaxMembers(e.target.value ? parseInt(e.target.value) : "");
              }}
              placeholder="e.g. 5"
              disabled={submitting}
            />
            {/* field-level errors are shown as toasts */}
          </div>

          <div className="flex items-center justify-start py-2 gap-3">
            <button
              title="button"
              type="button"
              onClick={() => !submitting && setIsLocked(!isLocked)}
              disabled={submitting}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isLocked ? "bg-red-500" : "bg-emerald-400"
                } ${submitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ${isLocked ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
            <Label htmlFor="isLocked" className="text-sm font-medium text-slate-700">
              Lock group (prevent changes)
            </Label>
          </div>

        </div>

        <SheetFooter className="flex flex-row justify-start gap-5">
          <Button className="btn btn-gradient-slow" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save changes" : "Create"}
          </Button>
          <Button className="text-violet-800 hover:text-violet-500" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
