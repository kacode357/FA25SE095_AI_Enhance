"use client";

import { useState, useCallback } from "react";
import { EnrollmentsService } from "@/services/enrollments.services";
import {
  JoinCoursePayload,
  LeaveCoursePayload,
} from "@/types/enrollments/enrollments.payload";
import {
  JoinCourseResponse,
  LeaveCourseResponse,
  EnrollmentStatusResponse,
} from "@/types/enrollments/enrollments.response";

/**
 * Hook quản lý enrollments (student join/leave/check)
 * ✅ Không toast (vì interceptor đã xử lý)
 * ✅ Quản lý loading + status
 */
export function useEnrollments() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<EnrollmentStatusResponse | null>(null);

  /** Enroll vào khoá học */
  const joinCourse = useCallback(
    async (
      courseId: string,
      payload?: JoinCoursePayload
    ): Promise<JoinCourseResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.joinCourse(courseId, payload);
        return res;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Rời khoá học */
  const leaveCourse = useCallback(
    async (
      courseId: string,
      payload?: LeaveCoursePayload
    ): Promise<LeaveCourseResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.leaveCourse(courseId, payload);
        return res;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Kiểm tra trạng thái enrollment */
  const checkStatus = useCallback(
    async (courseId: string): Promise<EnrollmentStatusResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.getEnrollmentStatus(courseId);
        setStatus(res);
        return res;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    status,
    joinCourse,
    leaveCourse,
    checkStatus,
  };
}
