// services/course-enrollment.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import { JoinCoursePayload, LeaveCoursePayload } from "@/types/courses/course.payload";
import { JoinCourseResponse, LeaveCourseResponse } from "@/types/courses/course.response";

export const CourseEnrollmentService = {
  joinCourse: async (
    courseId: string,
    data: JoinCoursePayload
  ): Promise<JoinCourseResponse> => {
    const response = await userAxiosInstance.post<JoinCourseResponse>(
      `/courses/${courseId}/enrollments/join`,
      data
    );
    return response.data;
  },

  leaveCourse: async (
    courseId: string,
    data?: LeaveCoursePayload
  ): Promise<LeaveCourseResponse> => {
    const response = await userAxiosInstance.post<LeaveCourseResponse>(
      `/courses/${courseId}/enrollments/leave`,
      data ?? {}
    );
    return response.data;
  },
};
