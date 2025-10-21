"use client";

import { CourseService } from "@/services/course.services";
import { InactivateCoursePayload } from "@/types/courses/course.payload";
import { InactivateCourseResponse } from "@/types/courses/course.response";
import { useState } from "react";
import { toast } from "sonner";

export function useInactivateCourse() {
  const [loading, setLoading] = useState(false);

  const inactivateCourse = async (
    id: string,
    payload: InactivateCoursePayload
  ): Promise<InactivateCourseResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await CourseService.inactivateCourse(id, payload);
      toast.success(res.message || "Course has been inactivated successfully");
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Failed to inactivate course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { inactivateCourse, loading };
}
