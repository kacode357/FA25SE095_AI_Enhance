"use client";

import { useState, useCallback } from "react";
import { CourseService } from "@/services/course.services";
import { GetMyCoursesQuery } from "@/types/courses/course.payload";
import { CourseItem, GetMyCoursesResponse } from "@/types/courses/course.response";

export function useMyCourses() {
  const [listData, setListData] = useState<CourseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCourses = useCallback(async (params: GetMyCoursesQuery) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res: GetMyCoursesResponse = await CourseService.getMyCourses(params);
      setListData(res.courses || []);
      setTotalCount(res.totalCount);
      setCurrentPage(res.currentPage);
      setPageSize(res.pageSize);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return {
    listData,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    fetchMyCourses,
  };
}
