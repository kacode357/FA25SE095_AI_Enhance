// hooks/enrollments/useCourseStudents.ts
"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { CourseEnrolledStudent, GetCourseEnrolledStudentsResponse } from "@/types/enrollments-students/enrollments.response";
import { useCallback, useState } from "react";

/**
 * 👥 Lấy danh sách sinh viên đã ghi danh của 1 course
 * - Không toast, không throw (interceptor đã lo lỗi)
 * - Trả về: data (full response), students (array), totalStudents, course info
 * - Dùng: const { loading, students, fetchCourseStudents } = useCourseStudents();
 */
export function useCourseStudents(courseId: string) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetCourseEnrolledStudentsResponse | null>(null);

  const fetchCourseStudents = useCallback(
    async (courseId: string): Promise<GetCourseEnrolledStudentsResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.getCourseStudents(courseId);
        setData(res);
        return res; // ✅ success
      } catch (_err) {
        // ❌ error đã được interceptor xử lý → không throw để tránh overlay
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );
 
  // tiện lấy nhanh students & total
  const students: CourseEnrolledStudent[] = data?.students ?? [];
  const totalStudents = data?.totalStudents ?? 0;

  return {
    loading,
    data,
    students,
    totalStudents,
    courseId: data?.courseId ?? null,
    courseName: data?.courseName ?? null,

    fetchCourseStudents,
  };
}
