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

  /** 🔄 Fetch danh sách courses khả dụng cho student */
  const fetchAvailableCourses = useCallback(
    async (params: GetAvailableCoursesQuery) => {
      setLoading(true);
      try {
        const res: GetAvailableCoursesResponse =
          await CourseService.getAvailableCourses(params);

        setListData(res.courses || []);
        setTotalCount(res.totalCount);
        setCurrentPage(res.currentPage);
        setPageSize(res.pageSize);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** 🔁 Refetch lại (reload) */
  const refetch = (params: GetAvailableCoursesQuery) =>
    fetchAvailableCourses(params);

  return {
    listData,
    totalCount,
    currentPage,
    pageSize,
    loading,
    fetchAvailableCourses,
    refetch,
  };
}
