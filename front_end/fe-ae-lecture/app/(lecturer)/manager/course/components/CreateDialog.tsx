"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourse } from "@/hooks/course/useCreateCourse";
import { useCourseCodeOptions } from "@/hooks/course-code/useCourseCodeOptions";
import { AccessCodeType } from "@/config/access-code-type";

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
  const { options: courseCodeOptions, loading: loadingCodes, fetchCourseCodeOptions } = useCourseCodeOptions();

  // ⚙️ State form
  const [form, setForm] = useState({
    courseCodeId: "",
    description: "",
    term: "",
    year: new Date().getFullYear(),
    requiresAccessCode: false,
    accessCodeType: undefined as AccessCodeType | undefined,
    accessCodeValue: "", // ✅ luôn có ô nhập cho mọi type
  });

  // 🚀 Chỉ fetch options 1 lần
  useEffect(() => {
    fetchCourseCodeOptions({ activeOnly: true });
  }, [fetchCourseCodeOptions]);

  // 🔧 Helper đổi state
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // 🔎 Placeholder & helper theo type (gợi ý nhập code)
  const codeHint = useMemo(() => {
    switch (form.accessCodeType) {
      case AccessCodeType.Numeric:
        return { placeholder: "e.g. 123456", helper: "Digits only (0-9)." };
      case AccessCodeType.AlphaNumeric:
        return { placeholder: "e.g. ABC123", helper: "Letters and digits (A-Z, 0-9)." };
      case AccessCodeType.Words:
        return { placeholder: "e.g. happy-cat-123", helper: "Words chained with dashes, may include digits." };
      case AccessCodeType.Custom:
        return { placeholder: "Enter any code", helper: "Any pattern you prefer." };
      default:
        return { placeholder: "Choose a type first", helper: "" };
    }
  }, [form.accessCodeType]);

  // 💾 Submit
  const handleSubmit = async () => {
    if (!form.courseCodeId) return;

    // 📨 Payload tạo course
    // Lưu ý: BE chấp nhận customAccessCode. Theo yêu cầu: dù type nào cũng cho phép gửi customAccessCode nếu user tự nhập.
    const payload: any = {
      courseCodeId: form.courseCodeId,
      description: form.description,
      term: form.term,
      year: form.year,
      requiresAccessCode: form.requiresAccessCode,
    };

    if (form.requiresAccessCode) {
      payload.accessCodeType = form.accessCodeType;
      if (form.accessCodeValue?.trim()) {
        payload.customAccessCode = form.accessCodeValue.trim();
      }
    }

    const res = await createCourse(payload);
    if (res?.success) onSubmit();
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* 📚 Course Code */}
        <div>
          <Label>Course Code</Label>
          <select
            value={form.courseCodeId}
            onChange={(e) => set("courseCodeId", e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
          >
            <option value="">{loadingCodes ? "Loading..." : "-- Select Course Code --"}</option>
            {courseCodeOptions.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.displayName || `${cc.code} - ${cc.title}`}
              </option>
            ))}
          </select>
        </div>

        {/* 📝 Description */}
        <div>
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* 📅 Term */}
        <div>
          <Label>Term</Label>
          <Input
            value={form.term}
            onChange={(e) => set("term", e.target.value)}
          />
        </div>

        {/* 📆 Year */}
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={form.year}
            onChange={(e) => set("year", parseInt(e.target.value))}
          />
        </div>

        {/* 🔐 Requires Access Code */}
        <div className="flex items-center gap-2">
          <input
            id="requiresCode"
            type="checkbox"
            checked={form.requiresAccessCode}
            onChange={(e) => set("requiresAccessCode", e.target.checked)}
          />
          <Label htmlFor="requiresCode">Requires Access Code</Label>
        </div>

        {/* 🔽 Access Code Settings (hiện khi bật) */}
        {form.requiresAccessCode && (
          <>
            <div>
              <Label>Access Code Type</Label>
              <select
                value={form.accessCodeType ?? ""}
                onChange={(e) =>
                  set("accessCodeType", e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
              >
                <option value="">-- Select Type --</option>
                <option value={AccessCodeType.Numeric}>Numeric</option>
                <option value={AccessCodeType.AlphaNumeric}>AlphaNumeric</option>
                <option value={AccessCodeType.Words}>Words</option>
                <option value={AccessCodeType.Custom}>Custom</option>
              </select>
            </div>

            {/* ✅ Ô nhập code luôn hiển thị cho mọi type, optional */}
            <div>
              <Label>Access Code (optional)</Label>
              <Input
                placeholder={codeHint.placeholder}
                value={form.accessCodeValue}
                onChange={(e) => set("accessCodeValue", e.target.value)}
                disabled={!form.accessCodeType}
              />
              {codeHint.helper && (
                <p className="text-xs text-slate-500 mt-1">{codeHint.helper}</p>
              )}
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={loading || !form.courseCodeId}>
          {loading ? "Creating..." : "Create"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
