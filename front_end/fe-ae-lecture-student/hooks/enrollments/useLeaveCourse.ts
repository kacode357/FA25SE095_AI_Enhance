"use client";

import { useState, useCallback } from "react";
import { EnrollmentsService } from "@/services/enrollments.services";
import {
  LeaveCourseResponse,
} from "@/types/enrollments/enrollments.response";

/**
 * 🚪 Hook cho phép student tự leave khỏi course
 */
export function useLeaveCourse() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeaveCourseResponse | null>(null);

  /** 🔹 Leave course theo courseId */
  const leaveCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    try {
      const res = await EnrollmentsService.leaveCourse(courseId);
      setResult(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    result,
    leaveCourse,
  };
}
