"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CourseRequestService } from "@/services/course-requests.services";
import { ProcessCourseRequestPayload } from "@/types/course-requests/course-requests.payload";
import { ProcessCourseRequestResponse } from "@/types/course-requests/course-requests.response";

export function useProcessCourseRequest() {
  const [loading, setLoading] = useState(false);

  const processCourseRequest = async (
    id: string,
    payload: ProcessCourseRequestPayload
  ): Promise<ProcessCourseRequestResponse | null> => {
    try {
      setLoading(true);
      const res = await CourseRequestService.process(id, payload);
      toast.success(res.message || "Course request processed successfully");
      return res;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to process request");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { processCourseRequest, loading };
}
