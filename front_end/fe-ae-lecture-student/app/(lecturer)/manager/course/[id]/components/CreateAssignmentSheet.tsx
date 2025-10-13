"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAssignment } from "@/hooks/assignment/useCreateAssignment";
import { CreateAssignmentPayload } from "@/types/assignment/assignment.payload";
import { useState } from "react";

export default function CreateAssignmentSheet({
  open,
  onOpenChange,
  courseId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  onCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [points, setPoints] = useState<number | "">("");
  const [desc, setDesc] = useState("");
  const [format, setFormat] = useState("");
  const [criteria, setCriteria] = useState("");
  const { createAssignment, loading } = useCreateAssignment();
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!courseId && !!title && !!due;

  const handleCreate = async () => {
    if (!canSubmit || loading) return;
  setError(null);
  const payload: CreateAssignmentPayload = {
      courseId,
      title: title.trim(),
      description: desc.trim(),
      dueDate: new Date(due).toISOString(),
      extendedDueDate: new Date(due).toISOString(),
      format: format.trim(),
      gradingCriteria: criteria.trim(),
    };
    const res = await createAssignment(payload);
    if (res?.success) {
      onCreated?.();
      // reset & close
      setTitle("");
      setDue("");
      setPoints("");
      setDesc("");
      setFormat("");
      setCriteria("");
      onOpenChange(false);
    } else {
      setError("Failed to create assignment");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-slate-200 w-full sm:max-w-xl md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create Assignment</SheetTitle>
        </SheetHeader>

        <div className="pb-4 px-4 space-y-3">
          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">{error}</div>
          )}
          <div>
            <Label htmlFor="assignmentTitle" className="py-2">Title</Label>
            <Input id="assignmentTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Report" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="assignmentDue" className="py-2">Due Date</Label>
            <Input id="assignmentDue" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 100"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="assignmentFormat" className="py-2">Format</Label>
            <Input id="assignmentFormat" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="e.g. PDF" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="assignmentCriteria" className="py-2">Grading Criteria</Label>
            <Textarea id="assignmentCriteria" value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="Rubric..." className="min-h-[80px]" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="assignmentDescription" className="py-2">Description</Label>
            <Textarea id="assignmentDescription" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What should students submit?" className="min-h-[120px]" disabled={loading} />
          </div>

          <p className="text-xs text-slate-500">Assignments will be added to this course.</p>
        </div>

        <SheetFooter className="flex flex-row gap-5 justify-start">
          <Button onClick={handleCreate} disabled={!canSubmit || loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
