// hooks/course/useJoinCourse.ts
"use client";

import { useState } from "react";
import { CourseEnrollmentService } from "@/services/course.services";
import { JoinCoursePayload } from "@/types/courses/course.payload";
import { JoinCourseResponse } from "@/types/courses/course.response";
import { toast } from "sonner";

export function useJoinCourse() {
  const [loading, setLoading] = useState(false);

  const joinCourse = async (
    courseId: string,
    payload: JoinCoursePayload
  ): Promise<JoinCourseResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseEnrollmentService.joinCourse(courseId, payload);
      toast.success(res.message || "Tham gia khoá học thành công");
      return res;
    } catch {
      // interceptor chung sẽ tự xử lý lỗi + toast
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { joinCourse, loading };
}
