// hooks/course/useCourseJoinInfo.ts
"use client";

import { useState } from "react";

import { CourseService } from "@/services/course.services";
import type {
  CourseJoinInfoItem,
  GetCourseJoinInfoResponse,
} from "@/types/courses/course.response";

export function useCourseJoinInfo() {
  const [data, setData] = useState<CourseJoinInfoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  const fetchCourseJoinInfo = async (
    id: string
  ): Promise<GetCourseJoinInfoResponse | null> => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const res = await CourseService.getCourseJoinInfo(id);

      if (res.success) {
        setData(res.course);
        setIsEnrolled(res.isEnrolled);
      } else {
        setError(res.message || "Failed to load course join info");
      }

      return res;
    } catch (err: any) {
      console.error("[useCourseJoinInfo] Failed to fetch join info", err);
      setError(err?.message || "Failed to load course join info");
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
    fetchCourseJoinInfo,
  };
}
