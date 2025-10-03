"use client";

import { useState, useCallback } from "react";
import { CourseService } from "@/services/course.services";
import { GetAvailableCoursesQuery } from "@/types/courses/course.payload";
import {
  AvailableCourseItem,
  GetAvailableCoursesResponse,
} from "@/types/courses/course.response";

export function useAvailableCourses() {
  const [listData, setListData] = useState<AvailableCourseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableCourses = useCallback(
    async (params: GetAvailableCoursesQuery) => {
      setLoading(true);
      setError(null);
      try {
        const res: GetAvailableCoursesResponse =
          await CourseService.getAvailableCourses(params);

        setListData(res.courses || []);
        setTotalCount(res.totalCount);
        setCurrentPage(res.currentPage);
        setPageSize(res.pageSize);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch available courses");
      } finally {
        setLoading(false);
      }
    },
    [] // ✅ callback stable, không bị recreate mỗi lần loading đổi
  );

  return {
    listData,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    fetchAvailableCourses,
  };
}
