// hooks/course-code/useUpdateCourseCode.ts
"use client";

import { useState } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import { UpdateCourseCodePayload } from "@/types/course-codes/course-codes.payload";
import { UpdateCourseCodeResponse } from "@/types/course-codes/course-codes.response";
import { toast } from "sonner";

export function useUpdateCourseCode() {
  const [loading, setLoading] = useState(false);

  const updateCourseCode = async (
    id: string,
    payload: UpdateCourseCodePayload
  ): Promise<UpdateCourseCodeResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseCodeService.update(id, payload);
      toast.success(res.message || "Cập nhật course code thành công");
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Failed to update course code");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateCourseCode, loading };
}
