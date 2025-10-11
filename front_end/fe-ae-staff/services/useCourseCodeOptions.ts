// hooks/course-code/useCourseCodeOptions.ts
"use client";

import { useState, useCallback } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import {
  GetCourseCodeOptionsQuery,
} from "@/types/course-codes/course-codes.payload";
import {
  CourseCodeOption,
  GetCourseCodeOptionsResponse,
} from "@/types/course-codes/course-codes.response";

export function useCourseCodeOptions() {
  const [options, setOptions] = useState<CourseCodeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseCodeOptions = useCallback(
    async (params?: GetCourseCodeOptionsQuery) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const res: GetCourseCodeOptionsResponse = await CourseCodeService.getOptions(params);
        setOptions(res || []);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch course code options");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return {
    options,
    loading,
    error,
    fetchCourseCodeOptions,
  };
}
