// hooks/course-code/useCreateCourseCode.ts
"use client";

import { useState } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import { CreateCourseCodePayload } from "@/types/course-codes/course-codes.payload";
import { CreateCourseCodeResponse } from "@/types/course-codes/course-codes.response";
import { toast } from "sonner";

export function useCreateCourseCode() {
  const [loading, setLoading] = useState(false);

  const createCourseCode = async (
    payload: CreateCourseCodePayload
  ): Promise<CreateCourseCodeResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseCodeService.create(payload);
      toast.success(res.message || "Tạo course code thành công");
      return res;
    } catch {
      // lỗi đã có interceptor xử lý
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCourseCode, loading };
}
