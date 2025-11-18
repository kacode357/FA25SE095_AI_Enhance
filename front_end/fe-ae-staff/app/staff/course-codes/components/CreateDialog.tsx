"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourseCode } from "@/hooks/course-code/useCreateCourseCode";
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
  const { createCourseCode, loading } = useCreateCourseCode();
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    department: "",
    isActive: true,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const res = await createCourseCode(form);
    if (res?.courseCode) {
      onSubmit();
      setForm({
        code: "",
        title: "",
        description: "",
        department: "",
        isActive: true,
      });
    }
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div>
          <Label>Code</Label>
          <Input value={form.code} onChange={(e) => handleChange("code", e.target.value)} />
        </div>
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
        </div>
        <div>
          <Label>Department</Label>
          <Input value={form.department} onChange={(e) => handleChange("department", e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input
          title="checkbox"
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
          />
          <Label htmlFor="isActive">Is Active</Label>
        </div>
      </div>
      <DialogFooter>
        <Button className="btn btn-gradient-slow" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </DialogFooter>
    </DialogContent>
  );
}
