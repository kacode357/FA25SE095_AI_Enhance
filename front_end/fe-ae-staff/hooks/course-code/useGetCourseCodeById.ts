// hooks/course-code/useGetCourseCodeById.ts
"use client";

import { useState } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import { CourseCode, GetCourseCodeByIdResponse } from "@/types/course-codes/course-codes.response";

export function useGetCourseCodeById() {
  const [data, setData] = useState<CourseCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseCodeById = async (
    id: string
  ): Promise<GetCourseCodeByIdResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await CourseCodeService.getById(id);
      setData(res.courseCode);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to get course code");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchCourseCodeById };
}
