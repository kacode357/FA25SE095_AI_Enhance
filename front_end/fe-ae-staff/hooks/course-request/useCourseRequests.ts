// hooks/course-request/useCourseRequests.ts
"use client";

import { useState } from "react";
import { CourseRequestService } from "@/services/course-requests.services";
import { GetCourseRequestsQuery } from "@/types/course-requests/course-requests.payload";
import { GetCourseRequestsResponse } from "@/types/course-requests/course-requests.response";

export function useCourseRequests() {
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<GetCourseRequestsResponse | null>(null);

  const fetchCourseRequests = async (params?: GetCourseRequestsQuery) => {
    setLoading(true);
    try {
      const res = await CourseRequestService.getAll(params);
      setListData(res);
      return res;
    } catch {
      // interceptor chung handle lỗi
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { listData, loading, fetchCourseRequests };
}
