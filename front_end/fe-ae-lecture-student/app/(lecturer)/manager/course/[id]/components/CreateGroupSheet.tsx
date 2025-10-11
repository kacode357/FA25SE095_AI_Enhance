"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GroupService } from "@/services/group.services";
import { CreateGroupPayload } from "@/types/group/group.payload";
import { GroupDetail } from "@/types/group/group.response";
import { useState } from "react";

export default function CreateGroupSheet({
  open,
  onOpenChange,
  courseId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  onCreated?: (group: GroupDetail) => void;
}) {
  // Match CreateGroupPayload shape
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState<number | "">("");
  const [isLocked, setIsLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!courseId && !!name && typeof maxMembers === "number" && maxMembers > 0;

  const handleCreate = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateGroupPayload = {
        courseId,
        name: name.trim(),
        description: description.trim(),
        maxMembers: Number(maxMembers),
        isLocked,
      };
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
    } catch (e: any) {
      setError(e?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-slate-200 w-full sm:max-w-xl md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create Group</SheetTitle>
        </SheetHeader>

        <div className="pb-4 px-4 space-y-3">
          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">{error}</div>
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

        <SheetFooter className="flex flex-row gap-5 justify-start">
          <Button onClick={handleCreate} disabled={!canSubmit || submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
