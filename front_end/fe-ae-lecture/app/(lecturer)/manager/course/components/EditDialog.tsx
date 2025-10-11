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
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import { useCourseCodeOptions } from "@/hooks/course-code/useCourseCodeOptions";
import { CourseItem } from "@/types/courses/course.response";

export default function EditDialog({
  course,
  title,
  onSubmit,
  onCancel,
}: {
  course: CourseItem;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { updateCourse, loading } = useUpdateCourse();
  const {
    options: courseCodeOptions,
    loading: loadingCodes,
    fetchCourseCodeOptions,
    hasFetched,
  } = useCourseCodeOptions();

  const [editingCode, setEditingCode] = useState(false);

  // 🔍 map courseCode → courseCodeId (nếu có match)
  const matchedOption = courseCodeOptions.find(
    (cc) => cc.code === course.courseCode
  );

  const [form, setForm] = useState({
    courseCodeId: matchedOption?.id || "",
    description: course.description || "",
    term: course.term || "",
    year: course.year || new Date().getFullYear(),
  });

  // ✅ Chỉ fetch course codes nếu chưa có cache
  useEffect(() => {
    if (!hasFetched) fetchCourseCodeOptions({ activeOnly: true });
  }, [hasFetched, fetchCourseCodeOptions]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.courseCodeId) return;
    const res = await updateCourse({
      courseId: course.id,
      ...form,
    });
    if (res?.success) onSubmit();
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      {loadingCodes ? (
        <div className="py-6 text-center text-slate-500">
          Loading course codes...
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Course Code */}
          <div>
            <Label>Course Code</Label>
            {!editingCode ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">
                  {course.courseCode} - {course.courseCodeTitle}
                </p>
                <Button
                  variant="ghost"
                  className="text-emerald-600 px-2 h-7"
                  onClick={() => setEditingCode(true)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={form.courseCodeId}
                  onChange={(e) => handleChange("courseCodeId", e.target.value)}
                  className="flex-1 border border-slate-300 rounded-md p-2 text-sm"
                >
                  <option value="">-- Select Course Code --</option>
                  {courseCodeOptions.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.displayName || `${cc.code} - ${cc.title}`}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  className="text-slate-500 px-2 h-7"
                  onClick={() => setEditingCode(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Term */}
          <div>
            <Label>Term</Label>
            <Input
              value={form.term}
              onChange={(e) => handleChange("term", e.target.value)}
            />
          </div>

          {/* Year */}
          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => handleChange("year", parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={handleSave} disabled={loading || !form.courseCodeId}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
