// hooks/course-code/useCourseCodes.ts
"use client";

import { useState, useCallback } from "react";
import { CourseCodeService } from "@/services/course-codes.services";
import { GetCourseCodesQuery } from "@/types/course-codes/course-codes.payload";
import { CourseCode, GetCourseCodesResponse } from "@/types/course-codes/course-codes.response";

export function useCourseCodes() {
  const [listData, setListData] = useState<CourseCode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseCodes = useCallback(async (params: GetCourseCodesQuery) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res: GetCourseCodesResponse = await CourseCodeService.getAll(params);
      setListData(res.courseCodes || []);
      setTotalCount(res.totalCount);
      setCurrentPage(res.currentPage);
      setPageSize(res.pageSize);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch course codes");
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
    fetchCourseCodes,
  };
}
