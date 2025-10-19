"use client";

import { useState, useCallback } from "react";
import { EnrollmentsService } from "@/services/enrollments.services";
import { JoinCoursePayload } from "@/types/enrollments/enrollments.payload";
import { JoinCourseResponse } from "@/types/enrollments/enrollments.response";

export function useJoinCourse() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JoinCourseResponse | null>(null);

  const joinCourse = useCallback(
    async (courseId: string, payload?: JoinCoursePayload): Promise<JoinCourseResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.joinCourse(courseId, payload);
        setResult(res);
        return res; 
      } catch (_err) {
        setResult(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, result, joinCourse };
}
