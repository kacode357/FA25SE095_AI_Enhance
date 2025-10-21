"use client";

import { CourseService } from "@/services/course.services";
import { GetCourseEnrollmentsQuery } from "@/types/courses/course.payload";
import { GetCourseEnrollmentsResponse } from "@/types/courses/course.response";
import { useState } from "react";

export function useCourseEnrollments() {
  const [data, setData] = useState<GetCourseEnrollmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEnrollments = async (
    courseId: string,
    query?: GetCourseEnrollmentsQuery
  ): Promise<GetCourseEnrollmentsResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseService.getEnrollments(courseId, query);
      setData(res);

      return res;
    } catch {
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchEnrollments };
}
