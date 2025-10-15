"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CourseService } from "@/services/course.services";
import { RejectCoursePayload } from "@/types/course/course.payload";
import { RejectCourseResponse } from "@/types/course/course.response";

export function useRejectCourse() {
  const [loading, setLoading] = useState(false);

  const rejectCourse = async (
    id: string,
    payload: RejectCoursePayload
  ): Promise<RejectCourseResponse | null> => {
    setLoading(true);
    const res = await CourseService.reject(id, payload);
    toast.success(res.message || "Course rejected successfully");
    setLoading(false);
    return res;
  };

  return { rejectCourse, loading };
}
