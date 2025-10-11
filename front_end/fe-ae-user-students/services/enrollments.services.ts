// services/enrollments.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
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
 * Enrollment service
 * Self-enrollment endpoints for student
 */
export const EnrollmentsService = {
  /** ✅ Join a course (self-enrollment) */
  joinCourse: async (
    courseId: string,
    data?: JoinCoursePayload
  ): Promise<JoinCourseResponse> => {
    const res = await courseAxiosInstance.post<JoinCourseResponse>(
      `/enrollments/courses/${courseId}/join`,
      data ?? {}
    );
    return res.data;
  },

  /** ✅ Leave a course (self-unenrollment) */
  leaveCourse: async (
    courseId: string,
    data?: LeaveCoursePayload
  ): Promise<LeaveCourseResponse> => {
    const res = await courseAxiosInstance.post<LeaveCourseResponse>(
      `/enrollments/courses/${courseId}/leave`,
      data ?? {}
    );
    return res.data;
  },

  /** ✅ Check enrollment status for current user */
  getEnrollmentStatus: async (
    courseId: string
  ): Promise<EnrollmentStatusResponse> => {
    const res = await courseAxiosInstance.get<EnrollmentStatusResponse>(
      `/enrollments/courses/${courseId}/status`
    );
    return res.data;
  },
};
