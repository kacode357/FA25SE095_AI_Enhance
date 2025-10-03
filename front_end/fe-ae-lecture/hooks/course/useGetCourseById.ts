"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { CourseItem, GetCourseByIdResponse } from "@/types/courses/course.response";

export function useGetCourseById() {
  const [data, setData] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseById = async (
    id: string
  ): Promise<GetCourseByIdResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await CourseService.getCourseById(id);
      setData(res.course);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to get course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchCourseById };
}
