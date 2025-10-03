// services/course.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import { GetAvailableCoursesQuery } from "@/types/courses/course.payload";
import { GetAvailableCoursesResponse } from "@/types/courses/course.response";

export const CourseService = {
  /** Lấy danh sách khoá học public để student duyệt/join */
  getAvailableCourses: async (
    params: GetAvailableCoursesQuery
  ): Promise<GetAvailableCoursesResponse> => {
    const res = await courseAxiosInstance.get<GetAvailableCoursesResponse>(
      "/courses/available",
      { params }
    );
    return res.data;
  },
};
