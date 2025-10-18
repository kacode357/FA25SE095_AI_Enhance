"use client";

import { useState, useCallback } from "react";
import { EnrollmentsService } from "@/services/enrollments.services";
import {
  JoinCoursePayload,
} from "@/types/enrollments/enrollments.payload";
import {
  JoinCourseResponse,
} from "@/types/enrollments/enrollments.response";

/**
 * 🧑‍🎓 Hook cho phép student join vào course
 */
export function useJoinCourse() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JoinCourseResponse | null>(null);

  /** 🔹 Join course bằng courseId + optional accessCode */
  const joinCourse = useCallback(
    async (courseId: string, payload?: JoinCoursePayload) => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.joinCourse(courseId, payload);
        setResult(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    result,
    joinCourse,
  };
}
