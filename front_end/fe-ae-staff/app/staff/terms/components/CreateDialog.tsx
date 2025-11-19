"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTerm } from "@/hooks/term/useCreateTerm";
import { useState } from "react";

export default function CreateDialog({
  title,
  onSubmit,
  onCancel,
}: {
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { createTerm, loading } = useCreateTerm();
  const defaultStart = new Date().toISOString();
  const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    startDate: defaultStart,
    endDate: defaultEnd,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      isActive: form.isActive,
      startDate: form.startDate,
      endDate: form.endDate,
    };
    const res = await createTerm(payload);
    if (res?.success) {
      onSubmit();
      setForm({ name: "", description: "", isActive: true, startDate: defaultStart, endDate: defaultEnd });
    }
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div>
          <Label className="mb-1">Name</Label>
          <Input placeholder="Enter Term name.." className="placeholder:text-sm text-sm" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
        </div>
        <div>
          <Label className="mb-1">Description</Label>
          <Input placeholder="Enter Term description.." className="placeholder:text-sm text-sm" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
        </div>
        <div className="flex gap-3">
          <div>
            <Label className="mb-1">Start Date</Label>
            <DateTimePicker
              value={form.startDate}
              onChange={(v) => handleChange("startDate", v)}
              placeholder="Select start date"
            />
          </div>
          <div>
            <Label className="mb-1">End Date</Label>
            <DateTimePicker
              value={form.endDate}
              onChange={(v) => handleChange("endDate", v)}
              placeholder="Select end date"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            title="checkbox"
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
          />
          <Label className="" htmlFor="isActive">Is Active</Label>
        </div>
      </div>
      <DialogFooter>
        <Button className="btn btn-gradient-slow" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
        {/* <Button variant="ghost" onClick={onCancel}>Cancel</Button> */}
      </DialogFooter>
    </DialogContent>
  );
}
