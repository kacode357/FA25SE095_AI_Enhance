"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { GetCourseEnrollmentsResponse } from "@/types/course/course.response";
import { GetCourseEnrollmentsQuery } from "@/types/course/course.payload";

/** ✅ Hook để lấy danh sách enrollments cho 1 course */
export function useCourseEnrollments() {
  const [data, setData] = useState<GetCourseEnrollmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEnrollments = async (
    courseId: string,
    query?: GetCourseEnrollmentsQuery
  ) => {
    setLoading(true);
    const res = await CourseService.getEnrollments(courseId, query);
    setData(res);
    setLoading(false);
  };

  return { data, loading, fetchEnrollments };
}
