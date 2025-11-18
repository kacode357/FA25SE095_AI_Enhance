"use client";

import { CourseService } from "@/services/course.services";
import {
  GetCourseByIdItems,
  GetCourseByIdResponse,
} from "@/types/courses/course.response";
import { useState } from "react";

// Cache tạm để tránh gọi API trùng lặp
// Lưu luôn cả course + isEnrolled để dùng lại
const cache = new Map<string, { course: GetCourseByIdItems; isEnrolled: boolean }>();

export function useGetCourseById() {
  const [data, setData] = useState<GetCourseByIdItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  const fetchCourseById = async (
    id: string,
    force = false
  ): Promise<GetCourseByIdResponse | null> => {
    if (!force && cache.has(id)) {
      const cached = cache.get(id)!;
      setData(cached.course);
      setIsEnrolled(cached.isEnrolled);

      return {
        success: true,
        message: "Loaded from cache",
        course: cached.course,
        isEnrolled: cached.isEnrolled,
      };
    }

    setLoading(true);
    setError(null);

    try {
      const res: GetCourseByIdResponse = await CourseService.getCourseById(id);

      if (res?.success && res.course) {
        const enrolled = !!res.isEnrolled;

        cache.set(id, {
          course: res.course,
          isEnrolled: enrolled,
        });

        setData(res.course);
        setIsEnrolled(enrolled);
      } else {
        setIsEnrolled(null);
      }

      return res;
    } catch (err: any) {
      console.error("Failed to fetch course:", err);
      setError(err?.message || "Failed to get course");
      setIsEnrolled(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    isEnrolled,
    fetchCourseById,
    refetch: (id: string) => fetchCourseById(id, true),
  };
}
