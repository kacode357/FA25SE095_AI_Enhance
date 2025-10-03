"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourse } from "@/hooks/course/useCreateCourse";
import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";
import { AccessCodeType, accessCodeTypeToString } from "@/config/access-code-type";

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
  const { listData: courseCodes, fetchCourseCodes } = useCourseCodes();

  const [form, setForm] = useState({
    courseCodeId: "",
    description: "",
    term: "",
    year: new Date().getFullYear(),
    requiresAccessCode: false,
    accessCodeType: undefined as AccessCodeType | undefined,
    customAccessCode: "",
  });

  useEffect(() => {
    fetchCourseCodes({ page: 1, pageSize: 50, isActive: true });
  }, []);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.courseCodeId) return;

    const payload: any = {
      courseCodeId: form.courseCodeId,
      description: form.description,
      term: form.term,
      year: form.year,
      requiresAccessCode: form.requiresAccessCode,
    };

    if (form.requiresAccessCode) {
      payload.accessCodeType = form.accessCodeType;
      if (form.accessCodeType === AccessCodeType.Custom) {
        payload.customAccessCode = form.customAccessCode;
      }
    }

    const res = await createCourse(payload);
    if (res?.success) {
      onSubmit();
      setForm({
        courseCodeId: "",
        description: "",
        term: "",
        year: new Date().getFullYear(),
        requiresAccessCode: false,
        accessCodeType: undefined,
        customAccessCode: "",
      });
    }
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Course Code */}
        <div>
          <Label>Course Code</Label>
          <select
            value={form.courseCodeId}
            onChange={(e) => handleChange("courseCodeId", e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 text-sm"
          >
            <option value="">-- Select Course Code --</option>
            {courseCodes.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.code} - {cc.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div>
          <Label>Term</Label>
          <Input
            value={form.term}
            onChange={(e) => handleChange("term", e.target.value)}
          />
        </div>

        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={form.year}
            onChange={(e) => handleChange("year", parseInt(e.target.value))}
          />
        </div>

        {/* Requires Access Code */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requiresAccessCode"
            checked={form.requiresAccessCode}
            onChange={(e) =>
              handleChange("requiresAccessCode", e.target.checked)
            }
          />
          <Label htmlFor="requiresAccessCode">Requires Access Code</Label>
        </div>

        {form.requiresAccessCode && (
          <>
            <div>
              <Label>Access Code Type</Label>
              <select
                value={form.accessCodeType ?? ""}
                onChange={(e) =>
                  handleChange("accessCodeType", parseInt(e.target.value))
                }
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
              >
                <option value="">-- Select Type --</option>
                <option value={AccessCodeType.Numeric}>Numeric</option>
                <option value={AccessCodeType.AlphaNumeric}>AlphaNumeric</option>
                <option value={AccessCodeType.Words}>Words</option>
                <option value={AccessCodeType.Custom}>Custom</option>
              </select>
            </div>

            {form.accessCodeType === AccessCodeType.Custom && (
              <div>
                <Label>Custom Access Code</Label>
                <Input
                  value={form.customAccessCode}
                  onChange={(e) =>
                    handleChange("customAccessCode", e.target.value)
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={loading || !form.courseCodeId}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
