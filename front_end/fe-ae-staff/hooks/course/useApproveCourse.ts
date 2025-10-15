"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CourseService } from "@/services/course.services";
import { ApproveCoursePayload } from "@/types/course/course.payload";
import { ApproveCourseResponse } from "@/types/course/course.response";

export function useApproveCourse() {
  const [loading, setLoading] = useState(false);

  const approveCourse = async (
    id: string,
    payload: ApproveCoursePayload
  ): Promise<ApproveCourseResponse | null> => {
    setLoading(true);
    const res = await CourseService.approve(id, payload);
    toast.success(res.message || "Course approved successfully");
    setLoading(false);
    return res;
  };

  return { approveCourse, loading };
}
