"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCourseCode } from "@/hooks/course-code/useUpdateCourseCode";
import { CourseCodeService } from "@/services/course-codes.services";
import { CourseCode } from "@/types/course-codes/course-codes.response";
import { useEffect, useState } from "react";

export default function EditDialog({
  courseCodeId,
  title,
  onSubmit,
  onCancel,
}: {
  courseCodeId: string;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { updateCourseCode, loading } = useUpdateCourseCode();
  const [courseCode, setCourseCode] = useState<CourseCode | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await CourseCodeService.getById(courseCodeId);
      setCourseCode(res.courseCode);
    } catch (err) {
      console.error("Failed to fetch course code detail", err);
    }
  };

  useEffect(() => {
    if (courseCodeId) {
      fetchDetail();
    }
  }, [courseCodeId]);

  const handleSave = async () => {
    if (!courseCode) return;
    const res = await updateCourseCode(courseCodeId, {
      id: courseCode.id,
      code: courseCode.code,
      title: courseCode.title,
      description: courseCode.description,
      department: courseCode.department,
      isActive: courseCode.isActive,
    });
    if (res?.success) {
      onSubmit();
    }
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {!courseCode ? (
        <div className="py-6 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="space-y-6 py-2">
          <div>
            <Label className="mb-2">Code</Label>
            <Input
              value={courseCode.code}
              onChange={(e) => setCourseCode({ ...courseCode, code: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2">Title</Label>
            <Input
              value={courseCode.title}
              onChange={(e) => setCourseCode({ ...courseCode, title: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2">Description</Label>
            <Textarea
              className="border-slate-200"
              value={courseCode.description}
              onChange={(e) => setCourseCode({ ...courseCode, description: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2">Department</Label>
            <Input
              value={courseCode.department}
              onChange={(e) => setCourseCode({ ...courseCode, department: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              title="checkbox"
              type="checkbox"
              id="isActive"
              checked={courseCode.isActive}
              onChange={(e) => setCourseCode({ ...courseCode, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive" className="text-blue-600">Is Active</Label>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button className="btn btn-green-slow" onClick={handleSave} disabled={loading || !courseCode}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="ghost" className="cursor-pointer" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
