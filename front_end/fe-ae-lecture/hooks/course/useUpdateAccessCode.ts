"use client";

import { useState, useCallback } from "react";
import { CourseService } from "@/services/course.services";
import { UpdateAccessCodeRequest } from "@/types/courses/course.payload";
import { UpdateAccessCodeResponse } from "@/types/courses/course.response";

export function useUpdateAccessCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAccessCode = useCallback(
    async (courseId: string, body: UpdateAccessCodeRequest): Promise<UpdateAccessCodeResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await CourseService.updateAccessCode(courseId, body);
        return res;
      } catch (e: any) {
        setError(e?.message ?? "Failed to update access code");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateAccessCode, loading, error };
}
