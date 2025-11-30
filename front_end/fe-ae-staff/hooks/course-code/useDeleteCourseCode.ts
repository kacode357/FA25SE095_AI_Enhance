// hooks/course-code/useDeleteCourseCode.ts
"use client";

import { CourseCodeService } from "@/services/course-codes.services";
import { DeleteCourseCodeResponse } from "@/types/course-codes/course-codes.response";
import { useState } from "react";

export function useDeleteCourseCode() {
  const [loading, setLoading] = useState(false);

  const deleteCourseCode = async (id: string): Promise<DeleteCourseCodeResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseCodeService.delete(id);
      return res;
    } catch (err: any) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCourseCode, loading };
}
