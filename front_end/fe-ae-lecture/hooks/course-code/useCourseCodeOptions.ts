"use client";

import { useState, useEffect } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import { GetCourseCodeOptionsQuery } from "@/types/course-codes/course-codes.payload";
import { CourseCodeOption } from "@/types/course-codes/course-codes.response";

// 🧠 Cache toàn cục
let cache: CourseCodeOption[] | null = null;
let fetchingPromise: Promise<CourseCodeOption[]> | null = null;

export function useCourseCodeOptions() {
  const [options, setOptions] = useState<CourseCodeOption[]>(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseCodeOptions = async (
    params?: GetCourseCodeOptionsQuery,
    force = false
  ) => {
    if (cache && !force) return cache;
    if (fetchingPromise) return fetchingPromise; // tránh double fetch

    setLoading(true);
    setError(null);

    fetchingPromise = CourseCodeService.getOptions(params)
      .then((res) => {
        cache = res || [];
        setOptions(cache);
        return cache;
      })
      .catch((err) => {
        const msg = err?.message || "Failed to fetch course code options";
        setError(msg);
        throw err;
      })
      .finally(() => {
        fetchingPromise = null;
        setLoading(false);
      });

    return fetchingPromise;
  };

  useEffect(() => {
    if (!cache) fetchCourseCodeOptions({ activeOnly: true });
  }, []);

  return {
    options,
    loading,
    error,
    fetchCourseCodeOptions,
    refetch: () => fetchCourseCodeOptions({ activeOnly: true }, true),
    hasFetched: !!cache,
  };
}
