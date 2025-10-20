// hooks/course/useCourseEnrollments.ts
"use client";

import { useCallback, useState } from "react";
import { CourseService } from "@/services/course.services";
import type { GetCourseEnrollmentsQuery } from "@/types/course/course.payload";
import type { GetCourseEnrollmentsResponse } from "@/types/course/course.response";

export function useCourseEnrollments() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetCourseEnrollmentsResponse | null>(null);

  /** ✅ fetch theo courseId + params (page, pageSize, studentName, sortDirection) */
  const fetchEnrollments = useCallback(
    async (courseId: string, params?: GetCourseEnrollmentsQuery) => {
      if (!courseId) return null;
      setLoading(true);
      try {
        const res = await CourseService.getEnrollments(courseId, params);
        setData(res);
        return res;
      } catch {
        // interceptor chung handle lỗi
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** ✅ reset state khi rời màn hình */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
  }, []);

  return { data, loading, fetchEnrollments, reset };
}
