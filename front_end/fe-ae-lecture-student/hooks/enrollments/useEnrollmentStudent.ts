"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import {
  EnrollmentStudentDetail,
  GetEnrollmentStudentResponse,
} from "@/types/enrollments/enrollments.response";
import { useCallback, useState } from "react";

export function useEnrollmentStudent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetEnrollmentStudentResponse | null>(null);

  const fetchCourseStudent = useCallback(
    async (
      courseId: string,
      studentId: string
    ): Promise<GetEnrollmentStudentResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.getCourseStudent(courseId, studentId);
        setData(res);
        return res;
      } catch (_err) {
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const student: EnrollmentStudentDetail | null = data?.student ?? null;

  return {
    loading,
    data,
    student,
    fetchCourseStudent,
  };
}
