// hooks/course-request/useCourseRequestById.ts
"use client";

import { useState } from "react";
import { CourseRequestService } from "@/services/course-requests.services";
import { GetCourseRequestByIdResponse } from "@/types/course-requests/course-requests.response";

export function useCourseRequestById() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetCourseRequestByIdResponse | null>(null);

  const fetchCourseRequestById = async (id: string) => {
    setLoading(true);
    try {
      const res = await CourseRequestService.getById(id);
      setData(res);
      return res;
    } catch {
      // interceptor chung handle lỗi
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchCourseRequestById };
}
