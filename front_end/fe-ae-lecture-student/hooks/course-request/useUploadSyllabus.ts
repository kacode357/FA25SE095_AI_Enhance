"use client";

import { CourseRequestService } from "@/services/course-requests.services";
import { UploadSyllabusResponse } from "@/types/course-requests/course-request.response";
import { useState } from "react";
import { toast } from "sonner";

export function useUploadSyllabus() {
  const [loading, setLoading] = useState(false);

  const uploadSyllabus = async (
    courseRequestId: string,
    file: File
  ): Promise<UploadSyllabusResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseRequestService.uploadSyllabus(courseRequestId, file);
      toast.success(res.message || "Syllabus uploaded successfully");
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadSyllabus, loading };
}
