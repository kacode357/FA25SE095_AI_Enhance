"use client";

import { CourseRequestService } from "@/services/course-requests.services";
import { GetMyCourseRequestsQuery } from "@/types/course-requests/course-request.payload";
import { CreateCourseRequestResponse, GetMyCourseRequestsResponse } from "@/types/course-requests/course-request.response";
import { useCallback, useState } from "react";

const cache = new Map<string, GetMyCourseRequestsResponse>();

export function useMyCourseRequests() {
  const [listData, setListData] = useState<CreateCourseRequestResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCourseRequests = useCallback(async (params: GetMyCourseRequestsQuery, force = false) => {
    const key = JSON.stringify(params);
    if (!force && cache.has(key)) {
      const cached = cache.get(key)!;
      setListData(cached.courseRequests || []);
      setTotalCount(cached.totalCount);
      setCurrentPage(cached.currentPage);
      setPageSize(cached.pageSize);
      return cached;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await CourseRequestService.getAll(params);
      console.log("res", res)
      cache.set(key, res);
      setListData(res.courseRequests || []);
      setTotalCount(res.totalCount);
      setCurrentPage(res.currentPage);
      setPageSize(res.pageSize);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to fetch course requests");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = (params: GetMyCourseRequestsQuery) => fetchMyCourseRequests(params, true);

  return { listData, totalCount, currentPage, pageSize, loading, error, fetchMyCourseRequests, refetch };
}
