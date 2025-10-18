// services/course.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  CreateCoursePayload,
  GetAvailableCoursesQuery,
  GetCourseEnrollmentsQuery,
  GetMyCoursesQuery,
  UpdateAccessCodeRequest,
  UpdateCoursePayload,
} from "@/types/courses/course.payload";
import {
  CreateCourseResponse,
  DeleteCourseResponse,
  GetAvailableCoursesResponse,
  GetCourseByIdResponse,
  GetCourseEnrollmentsResponse,
  GetMyCoursesResponse,
  UpdateAccessCodeResponse,
  UpdateCourseResponse,
} from "@/types/courses/course.response";

export const CourseService = {
  /** Tạo course (Lecturer only) */
  createCourse: async (data: CreateCoursePayload): Promise<CreateCourseResponse> => {
    const res = await courseAxiosInstance.post<CreateCourseResponse>("/Courses", data);
    return res.data;
  },

  /** Lấy danh sách course của current user (Lecturer/Student) */
  getMyCourses: async (params: GetMyCoursesQuery): Promise<GetMyCoursesResponse> => {
    const res = await courseAxiosInstance.get<GetMyCoursesResponse>("/Courses/my-courses", { params });
    return res.data;
  },

  /** Update course (Lecturer only - own courses) */
  updateCourse: async (data: UpdateCoursePayload): Promise<UpdateCourseResponse> => {
    const res = await courseAxiosInstance.put<UpdateCourseResponse>("/Courses", data);
    return res.data;
  },

  /** Lấy chi tiết course theo id */
  getCourseById: async (id: string): Promise<GetCourseByIdResponse> => {
    const res = await courseAxiosInstance.get<GetCourseByIdResponse>(`/Courses/${id}`);
    return res.data;
  },

  /** Xóa course (Lecturer only - own courses) */
  deleteCourse: async (id: string): Promise<DeleteCourseResponse> => {
    const res = await courseAxiosInstance.delete<DeleteCourseResponse>(`/Courses/${id}`);
    return res.data;
  },

  updateAccessCode: async (
    id: string,
    body: UpdateAccessCodeRequest
  ): Promise<UpdateAccessCodeResponse> => {
    const res = await courseAxiosInstance.post<UpdateAccessCodeResponse>(`/Courses/${id}/access-code`, body);
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

  /** ✅ GET /api/Courses/available (Student public access) */
  getAvailableCourses: async (
    params?: GetAvailableCoursesQuery
  ): Promise<GetAvailableCoursesResponse> => {
    const res = await courseAxiosInstance.get<GetAvailableCoursesResponse>(
      "/Courses/available",
      { params }
    );
    return res.data;
  },
};
