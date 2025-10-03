// hooks/course/useDeleteCourse.ts
"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { DeleteCourseResponse } from "@/types/courses/course.response";
import { toast } from "sonner";

export function useDeleteCourse() {
  const [loading, setLoading] = useState(false);

  const deleteCourse = async (id: string): Promise<DeleteCourseResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseService.deleteCourse(id);
      toast.success(res.message);
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCourse, loading };
}
