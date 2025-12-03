"use client";

import { CourseService } from "@/services/course.services";
import { DeleteSyllabusPayload } from "@/types/courses/course.payload";
import { DeleteSyllabusResponse } from "@/types/courses/course.response";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteSyllabus() {
  const [loading, setLoading] = useState(false);

  const deleteSyllabus = async (
    data: DeleteSyllabusPayload
  ): Promise<DeleteSyllabusResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseService.deleteSyllabus({ courseId: data.courseId });
      if (res?.success) {
        toast.success(res.message || "Syllabus deleted successfully");
      } else {
        toast.error(res.message || "Unable to delete syllabus");
      }
      return res;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error while deleting syllabus");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteSyllabus, loading };
}
