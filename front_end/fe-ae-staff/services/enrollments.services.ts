import { courseAxiosInstance } from "@/config/axios.config";
import { GetCourseEnrolledStudentsResponse } from "@/types/enrollments-students/enrollments.response";

export const EnrollmentsService = {
  /** 👥 Get all enrolled students in a course */
  getCourseStudents: async (
    courseId: string
  ): Promise<GetCourseEnrolledStudentsResponse> => {
    const res =
      await courseAxiosInstance.get<GetCourseEnrolledStudentsResponse>(
        `/enrollments/courses/${courseId}/students`
      );
    return res.data;
  },

};
