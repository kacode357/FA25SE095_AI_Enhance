// hooks/course-code/useUpdateCourseCode.ts
"use client";

import { CourseCodeService } from "@/services/course-codes.services";
import { UpdateCourseCodePayload } from "@/types/course-codes/course-codes.payload";
import { UpdateCourseCodeResponse } from "@/types/course-codes/course-codes.response";
import { useState } from "react";

export function useUpdateCourseCode() {
  const [loading, setLoading] = useState(false);

  const updateCourseCode = async (
    id: string,
    payload: UpdateCourseCodePayload
  ): Promise<UpdateCourseCodeResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseCodeService.update(id, payload);
      return res;
    } catch (err: any) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateCourseCode, loading };
}
