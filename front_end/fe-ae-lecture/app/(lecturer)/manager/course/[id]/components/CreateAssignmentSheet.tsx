"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function CreateAssignmentSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [points, setPoints] = useState<number | "">("");
  const [desc, setDesc] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-slate-200">
        <SheetHeader>
          <SheetTitle>Create Assignment</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Report" />
          </div>

          <div>
            <Label>Due Date</Label>
            <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>

          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 100"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What should students submit?"
              className="min-h-[120px]"
            />
          </div>

          <p className="text-xs text-slate-500">
            UI-only. Plug into your assignment API later.
          </p>
        </div>

        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)} disabled={!title || !due}>Create (Mock)</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
