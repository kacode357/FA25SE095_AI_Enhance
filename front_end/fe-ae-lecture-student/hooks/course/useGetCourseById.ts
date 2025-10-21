"use client";

import { CourseService } from "@/services/course.services";
import {
  GetCourseByIdItems,
  GetCourseByIdResponse,
} from "@/types/courses/course.response";
import { useState } from "react";

// Cache tạm để tránh gọi API trùng lặp
const cache = new Map<string, GetCourseByIdItems>();

export function useGetCourseById() {
  const [data, setData] = useState<GetCourseByIdItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseById = async (id: string, force = false) => {
    if (!force && cache.has(id)) {
      const cachedCourse = cache.get(id)!;
      setData(cachedCourse);
      return { course: cachedCourse };
    }

    setLoading(true);
    setError(null);

    try {
      const res: GetCourseByIdResponse = await CourseService.getCourseById(id);

      if (res?.success && res.course) {
        cache.set(id, res.course);
        setData(res.course);
      }

      return res;
    } catch (err: any) {
      console.error("Failed to fetch course:", err);
      setError(err?.message || "Failed to get course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchCourseById,
    refetch: (id: string) => fetchCourseById(id, true),
  };
}
