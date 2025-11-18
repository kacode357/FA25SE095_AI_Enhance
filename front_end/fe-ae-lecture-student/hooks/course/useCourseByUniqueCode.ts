"use client";

import { useCallback, useState } from "react";
import { CourseService } from "@/services/course.services";
import type {
  CourseByUniqueCodeItem,
  GetCourseByUniqueCodeResponse,
} from "@/types/courses/course.response";

export function useCourseByUniqueCode() {
  const [course, setCourse] = useState<CourseByUniqueCodeItem | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearResult = useCallback(() => {
    setCourse(null);
    setIsEnrolled(null);
    setLastCode(null);
  }, []);

  const searchByCode = useCallback(
    async (rawCode: string): Promise<GetCourseByUniqueCodeResponse | null> => {
      const uniqueCode = rawCode.trim().toUpperCase();

      if (!uniqueCode) {
        clearResult();
        return null;
      }

      if (loading) return null;

      setLoading(true);
      try {
        const res = await CourseService.getCourseByUniqueCode(uniqueCode);

        setCourse(res.course);
        setIsEnrolled(res.isEnrolled);
        setLastCode(uniqueCode);

        return res;
      } finally {
        setLoading(false);
      }
    },
    [clearResult, loading]
  );

  return {
    course,
    isEnrolled,
    lastCode,
    loading,
    searchByCode,
    clearResult,
  };
}
