// hooks/useCreateCourse.ts
"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { CreateCoursePayload } from "@/types/courses/course.payload";
import { CreateCourseResponse } from "@/types/courses/course.response";
import { toast } from "sonner";

export function useCreateCourse() {
  const [loading, setLoading] = useState(false);

  const createCourse = async (
    payload: CreateCoursePayload
  ): Promise<CreateCourseResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseService.createCourse(payload);
      toast.success(res.message || "Tạo khoá học thành công");
      return res;
    } catch {
      // interceptor chung sẽ xử lý lỗi + toast
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCourse, loading };
}
