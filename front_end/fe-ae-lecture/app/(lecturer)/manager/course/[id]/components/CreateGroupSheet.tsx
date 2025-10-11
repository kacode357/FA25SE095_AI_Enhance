"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function CreateGroupSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [autoAssign, setAutoAssign] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-slate-200">
        <SheetHeader>
          <SheetTitle>Create Group</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-3">
          <div>
            <Label>Group Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lab Team A" />
          </div>

          <div>
            <Label>Group Size</Label>
            <Input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 5"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="autoAssign"
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
            />
            <Label htmlFor="autoAssign">Auto-assign students to groups</Label>
          </div>

          <p className="text-xs text-slate-500">
            This form is UI-only. Hook it to your API later.
          </p>
        </div>

        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)} disabled={!name || !size}>Create (Mock)</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
