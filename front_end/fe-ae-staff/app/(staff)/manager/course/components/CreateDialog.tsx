"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { AccessCodeType } from "@/config/access-code-type";
import { useCreateCourse } from "@/hooks/course/useCreateCourse";

export default function CreateDialog({
  title,
  onSubmit,
  onCancel,
}: {
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { createCourse, loading } = useCreateCourse();
  const [form, setForm] = useState({
    courseCode: "",
    name: "",
    requiresAccessCode: false,
    accessCodeType: AccessCodeType.Numeric,
    customAccessCode: "",
    accessCodeExpiresAt: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const res = await createCourse({
      courseCode: form.courseCode,
      name: form.name,
      requiresAccessCode: form.requiresAccessCode,
      accessCodeType: form.requiresAccessCode ? form.accessCodeType : undefined,
      customAccessCode: form.requiresAccessCode ? form.customAccessCode || undefined : undefined,
      accessCodeExpiresAt: form.requiresAccessCode ? form.accessCodeExpiresAt || undefined : undefined,
    });

    if (res?.course) {
      onSubmit();
      setForm({
        courseCode: "",
        name: "",
        requiresAccessCode: false,
        accessCodeType: AccessCodeType.Numeric,
        customAccessCode: "",
        accessCodeExpiresAt: "",
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
          <Label>Course Code</Label>
          <Input value={form.courseCode} onChange={(e) => handleChange("courseCode", e.target.value)} />
        </div>
        <div>
          <Label>Course Name</Label>
          <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requiresAccessCode"
            checked={form.requiresAccessCode}
            onChange={(e) => handleChange("requiresAccessCode", e.target.checked)}
          />
          <Label htmlFor="requiresAccessCode">Requires Access Code</Label>
        </div>
        {form.requiresAccessCode && (
          <>
            <div>
              <Label>Access Code Type</Label>
              <Select
                value={String(form.accessCodeType)}
                onValueChange={(v) => handleChange("accessCodeType", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(AccessCodeType.Numeric)}>Numeric</SelectItem>
                  <SelectItem value={String(AccessCodeType.AlphaNumeric)}>Alphanumeric</SelectItem>
                  <SelectItem value={String(AccessCodeType.Words)}>Words</SelectItem>
                  <SelectItem value={String(AccessCodeType.Custom)}>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Custom Access Code</Label>
              <Input
                value={form.customAccessCode}
                onChange={(e) => handleChange("customAccessCode", e.target.value)}
                placeholder="Optional unless type = Custom"
              />
            </div>
            <div>
              <Label>Access Code Expiration</Label>
              <Input
                type="datetime-local"
                value={form.accessCodeExpiresAt}
                onChange={(e) => handleChange("accessCodeExpiresAt", e.target.value)}
              />
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </DialogFooter>
    </DialogContent>
  );
}
