"use client";

import { CourseRequestService } from "@/services/course-requests.services";
import { CourseRequestPayload } from "@/types/course-requests/course-request.payload";
import { CourseRequestResponse } from "@/types/course-requests/course-request.response";
import { useState } from "react";
import { toast } from "sonner";

export function useCreateCourseRequest() {
  const [loading, setLoading] = useState(false);

  const createCourseRequest = async (
    payload: CourseRequestPayload
  ): Promise<CourseRequestResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseRequestService.create(payload);
      toast.success(res.message || "Course creation request sent successfully");
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCourseRequest, loading };
}
