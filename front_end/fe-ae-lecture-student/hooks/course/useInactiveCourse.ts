"use client";

import { CourseService } from "@/services/course.services";
import { InactivateCoursePayload } from "@/types/courses/course.payload";
import { InactivateCourseResponse } from "@/types/courses/course.response";
import axios from "axios";
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

      toast.success(
        res?.message || "Course has been inactivated successfully"
      );

      return res;
    } catch (error) {
      // Bắt lỗi đúng chuẩn axios
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Failed to inactivate course"
        );
      } else {
        toast.error("Failed to inactivate course");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { inactivateCourse, loading };
}
