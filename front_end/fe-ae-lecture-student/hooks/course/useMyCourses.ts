"use client";

import { useState, useCallback } from "react";
import { CourseService } from "@/services/course.services";
import { GetMyCoursesQuery } from "@/types/courses/course.payload";
import { CourseItem, GetMyCoursesResponse } from "@/types/courses/course.response";

const cache = new Map<string, GetMyCoursesResponse>();

export function useMyCourses() {
  const [listData, setListData] = useState<CourseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchMyCourses = useCallback(async (params: GetMyCoursesQuery, force = false) => {
    const key = JSON.stringify(params);
    if (!force && cache.has(key)) {
      const cached = cache.get(key)!;
      setListData(cached.courses);
      setTotalCount(cached.totalCount);
      setCurrentPage(cached.currentPage);
      setPageSize(cached.pageSize);
      return cached;
    }

    setLoading(true);
    try {
      const res: GetMyCoursesResponse = await CourseService.getMyCourses(params);
      cache.set(key, res);
      setListData(res.courses || []);
      setTotalCount(res.totalCount);
      setCurrentPage(res.currentPage);
      setPageSize(res.pageSize);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = (params: GetMyCoursesQuery) => fetchMyCourses(params, true);

  return { listData, totalCount, currentPage, pageSize, loading, fetchMyCourses, refetch };
}