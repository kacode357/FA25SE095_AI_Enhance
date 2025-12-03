"use client";

import { CourseRequestService } from "@/services/course-requests.services";
import { DeleteSyllabusResponse } from "@/types/course-requests/course-request.response";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteSyllabus() {
  const [loading, setLoading] = useState(false);

  const deleteSyllabus = async (
    courseRequestId: string
  ): Promise<DeleteSyllabusResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseRequestService.deleteSyllabus(courseRequestId);
      toast.success(res.message || "Syllabus deleted successfully");
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteSyllabus, loading };
}
