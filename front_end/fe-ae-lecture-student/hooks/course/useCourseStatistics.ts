"use client";

import { CourseService } from "@/services/course.services";
import { GetCourseStatisticsResponse } from "@/types/courses/course.response";
import { useCallback, useState } from "react";

export function useCourseStatistics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetCourseStatisticsResponse | null>(null);

  // ✅ giữ reference ổn định, tránh đổi mỗi render
  const fetchCourseStatistics = useCallback(async (courseId: string) => {
    setLoading(true);
    try {
      const res = await CourseService.getStatistics(courseId);
      setData(res);
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetchCourseStatistics };
}
