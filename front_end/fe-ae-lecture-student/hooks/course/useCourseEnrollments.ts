"use client";

import { CourseService } from "@/services/course.services";
import { GetCourseEnrollmentsQuery } from "@/types/courses/course.payload";
import { GetCourseEnrollmentsResponse } from "@/types/courses/course.response";
import { useState } from 'react';

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
