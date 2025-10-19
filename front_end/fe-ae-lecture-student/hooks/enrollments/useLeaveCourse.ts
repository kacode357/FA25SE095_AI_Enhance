// hooks/enrollments/useLeaveCourse.ts
"use client";

import { useState, useCallback } from "react";
import { EnrollmentsService } from "@/services/enrollments.services";
import { LeaveCourseResponse } from "@/types/enrollments/enrollments.response";

/**
 * 🚪 Hook cho phép student tự leave khỏi course
 * - ĐÃ BẮT LỖI: không để Promise reject ra UI (tránh Next.js overlay)
 * - Interceptor axios đã toast.error khi fail → ở đây KHÔNG toast lại
 * - Trả về: LeaveCourseResponse | null
 */
export function useLeaveCourse() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeaveCourseResponse | null>(null);

  /** 🔹 Leave course theo courseId */
  const leaveCourse = useCallback(
    async (courseId: string): Promise<LeaveCourseResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.leaveCourse(courseId);
        setResult(res);
        return res; // ✅ success
      } catch (_err) {
        // ❌ error đã được interceptor toast.error
        setResult(null);
        return null; // không throw để tránh Runtime AxiosError overlay
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    result,
    leaveCourse,
  };
}
