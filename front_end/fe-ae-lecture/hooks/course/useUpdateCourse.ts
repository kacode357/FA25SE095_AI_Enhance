"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { UpdateCoursePayload } from "@/types/courses/course.payload";
import { UpdateCourseResponse } from "@/types/courses/course.response";
import { toast } from "sonner";

export function useUpdateCourse() {
  const [loading, setLoading] = useState(false);

  const updateCourse = async (payload: UpdateCoursePayload): Promise<UpdateCourseResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await CourseService.updateCourse(payload);
      toast.success(res.message || "Cập nhật khoá học thành công");
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Failed to update course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateCourse, loading };
}
