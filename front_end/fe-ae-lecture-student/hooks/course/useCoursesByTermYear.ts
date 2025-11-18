// hooks/course/useCoursesByTermYear.ts
"use client";

import { useCallback, useState } from "react";
import { CourseService } from "@/services/course.services";
import type {
  GetCoursesByTermYearQuery,
} from "@/types/courses/course.payload";
import type {
  GetCoursesByTermYearResponse,
  CoursesByTermYearItem,
} from "@/types/courses/course.response";

type CoursesByTermYearMeta = {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  termName: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const DEFAULT_PARAMS: Omit<GetCoursesByTermYearQuery, "termId"> = {
  page: 1,
  pageSize: 20,
  sortBy: "Name",
  sortDirection: "asc",
};

const EMPTY_META: CoursesByTermYearMeta = {
  totalCount: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  termName: "",
  hasPreviousPage: false,
  hasNextPage: false,
};

/**
 * Hook gọi GET /api/Courses/by-term-year
 * - BẮT BUỘC truyền termId trong initialParams
 * - Các filter/sort khác optional
 *
 * Ví dụ dùng:
 * const { data, meta, loading, fetchCourses } = useCoursesByTermYear({
 *   termId,
 *   status: 2, // Active
 * });
 */
export function useCoursesByTermYear(initialParams: GetCoursesByTermYearQuery) {
  const [data, setData] = useState<CoursesByTermYearItem[]>([]);
  const [meta, setMeta] = useState<CoursesByTermYearMeta>(EMPTY_META);
  const [params, setParams] = useState<GetCoursesByTermYearQuery>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(
    async (override?: Partial<GetCoursesByTermYearQuery>): Promise<GetCoursesByTermYearResponse | null> => {
      if (loading) return null; // tránh spam
      setLoading(true);
      try {
        const finalParams: GetCoursesByTermYearQuery = {
          ...params,
          ...override,
        };

        const res = await CourseService.getCoursesByTermYear(finalParams);

        setData(res.courses || []);
        setMeta({
          totalCount: res.totalCount,
          page: res.page,
          pageSize: res.pageSize,
          totalPages: res.totalPages,
          termName: res.termName,
          hasPreviousPage: (res as any).hasPreviousPage ?? false,
          hasNextPage: (res as any).hasNextPage ?? false,
        });
        setParams(finalParams);

        return res;
      } finally {
        setLoading(false);
      }
    },
    [params, loading]
  );

  return {
    data,
    loading,
    meta,
    params,
    setParams,
    fetchCourses,
  };
}
