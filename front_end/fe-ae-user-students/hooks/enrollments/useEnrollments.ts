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
import { toast } from "sonner";

export function useEnrollments() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<EnrollmentStatusResponse | null>(null);

  /** Join a course */
  const joinCourse = useCallback(
    async (courseId: string, payload?: JoinCoursePayload): Promise<JoinCourseResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.joinCourse(courseId, payload);

        if (res.success) {
          toast.success(res.message || "Tham gia khoá học thành công");
        } else {
          toast.error(res.message || "Không thể tham gia khoá học");
        }

        return res;
      } catch (err: any) {
        toast.error(err?.message || "Lỗi khi tham gia khoá học");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Leave a course */
  const leaveCourse = useCallback(
    async (courseId: string, payload?: LeaveCoursePayload): Promise<LeaveCourseResponse | null> => {
      setLoading(true);
      try {
        const res = await EnrollmentsService.leaveCourse(courseId, payload);

        if (res.success) {
          toast.success(res.message || "Rời khoá học thành công");
        } else {
          toast.error(res.message || "Không thể rời khoá học");
        }

        return res;
      } catch (err: any) {
        toast.error(err?.message || "Lỗi khi rời khoá học");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Check enrollment status */
  const checkStatus = useCallback(async (courseId: string): Promise<EnrollmentStatusResponse | null> => {
    setLoading(true);
    try {
      const res = await EnrollmentsService.getEnrollmentStatus(courseId);
      setStatus(res);
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Không thể lấy trạng thái enrollment");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    status,
    joinCourse,
    leaveCourse,
    checkStatus,
  };
}
