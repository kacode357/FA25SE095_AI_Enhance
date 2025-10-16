// services/course.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  ApproveCoursePayload,
  GetAllCoursesQuery,
  GetCourseEnrollmentsQuery,
  RejectCoursePayload,
} from "@/types/course/course.payload";
import {
  ApproveCourseResponse,
  GetAllCoursesResponse,
  GetCourseByIdResponse,
  GetCourseEnrollmentsResponse,
  RejectCourseResponse,
} from "@/types/course/course.response";

export const CourseService = {
  /** ✅ GET /api/Courses/all (Staff only) */
  getAll: async (params?: GetAllCoursesQuery): Promise<GetAllCoursesResponse> => {
    const res = await courseAxiosInstance.get<GetAllCoursesResponse>("/Courses/all", {
      params,
    });
    return res.data;
  },

  /** ✅ GET /api/Courses/{id} (Staff only) */
  getById: async (id: string): Promise<GetCourseByIdResponse> => {
    const res = await courseAxiosInstance.get<GetCourseByIdResponse>(`/Courses/${id}`);
    return res.data;
  },

  /** ✅ PUT /api/Courses/{id}/approve */
  approve: async (id: string, payload: ApproveCoursePayload): Promise<ApproveCourseResponse> => {
    const res = await courseAxiosInstance.put<ApproveCourseResponse>(
      `/Courses/${id}/approve`,
      payload
    );
    return res.data;
  },

  /** ✅ PUT /api/Courses/{id}/reject */
  reject: async (id: string, payload: RejectCoursePayload): Promise<RejectCourseResponse> => {
    const res = await courseAxiosInstance.put<RejectCourseResponse>(
      `/Courses/${id}/reject`,
      payload
    );
    return res.data;
  },
  
   /** ✅ GET /api/Courses/{id}/enrollments (Lecturer/Staff only) */
  getEnrollments: async (
    id: string,
    params?: GetCourseEnrollmentsQuery
  ): Promise<GetCourseEnrollmentsResponse> => {
    const res = await courseAxiosInstance.get<GetCourseEnrollmentsResponse>(
      `/Courses/${id}/enrollments`,
      { params }
    );
    return res.data;
  },
};
