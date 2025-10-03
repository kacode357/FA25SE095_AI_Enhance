// hooks/course-code/useDeleteCourseCode.ts
"use client";

import { useState } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import { DeleteCourseCodeResponse } from "@/types/course-codes/course-codes.response";
import { toast } from "sonner";

export function useDeleteCourseCode() {
  const [loading, setLoading] = useState(false);

  const deleteCourseCode = async (id: string): Promise<DeleteCourseCodeResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseCodeService.delete(id);
      toast.success(res.message || "Xoá course code thành công");
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete course code");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCourseCode, loading };
}
