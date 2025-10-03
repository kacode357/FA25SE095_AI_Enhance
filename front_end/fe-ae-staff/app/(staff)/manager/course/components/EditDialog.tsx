"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import { CourseService } from "@/services/course.services";
import { CourseItem } from "@/types/courses/course.response";

export default function EditDialog({
  courseId,
  title,
  onSubmit,
  onCancel,
}: {
  courseId: string;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { updateCourse, loading } = useUpdateCourse();
  const [course, setCourse] = useState<CourseItem | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await CourseService.getCourseById(courseId);
      setCourse(res.course);
    } catch (err) {
      console.error("Failed to fetch course detail", err);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchDetail();
    }
  }, [courseId]);

  const handleSave = async () => {
    if (!course) return;
    const res = await updateCourse({
      courseId,
      courseCode: course.courseCode,
      courseName: course.name,
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
      {!course ? (
        <div className="py-6 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="space-y-4 py-2">
          <div>
            <Label>Course Code</Label>
            <Input
              value={course.courseCode}
              onChange={(e) => setCourse({ ...course, courseCode: e.target.value })}
            />
          </div>
          <div>
            <Label>Course Name</Label>
            <Input
              value={course.name}
              onChange={(e) => setCourse({ ...course, name: e.target.value })}
            />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button onClick={handleSave} disabled={loading || !course}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
