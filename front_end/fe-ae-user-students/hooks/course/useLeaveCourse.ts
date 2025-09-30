// hooks/course/useLeaveCourse.ts
"use client";

import { useState } from "react";
import { CourseEnrollmentService } from "@/services/course.services";
import { LeaveCoursePayload } from "@/types/courses/course.payload";
import { LeaveCourseResponse } from "@/types/courses/course.response";
import { toast } from "sonner";

export function useLeaveCourse() {
  const [loading, setLoading] = useState(false);

  const leaveCourse = async (
    courseId: string,
    payload?: LeaveCoursePayload
  ): Promise<LeaveCourseResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseEnrollmentService.leaveCourse(courseId, payload);
      toast.success(res.message || "Rời khoá học thành công");
      return res;
    } catch {
      // interceptor chung sẽ tự xử lý lỗi + toast
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { leaveCourse, loading };
}
