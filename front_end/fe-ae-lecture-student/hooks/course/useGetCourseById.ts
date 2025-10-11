"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { CourseItem, GetCourseByIdResponse } from "@/types/courses/course.response";

const cache = new Map<string, CourseItem>();

export function useGetCourseById() {
  const [data, setData] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseById = async (id: string, force = false) => {
    if (!force && cache.has(id)) {
      const c = cache.get(id)!;
      setData(c);
      return { course: c };
    }

    setLoading(true);
    setError(null);
    try {
      const res: GetCourseByIdResponse = await CourseService.getCourseById(id);
      cache.set(id, res.course);
      setData(res.course);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to get course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchCourseById, refetch: (id: string) => fetchCourseById(id, true) };
}
