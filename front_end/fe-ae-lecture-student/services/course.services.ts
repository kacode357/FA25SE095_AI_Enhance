// services/course.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  CreateCoursePayload,
  DeleteCourseImageRequest,
  GetAvailableCoursesQuery,
  GetCourseEnrollmentsQuery,
  GetMyCoursesQuery,
  InactivateCoursePayload,
  UpdateAccessCodeRequest,
  UpdateCoursePayload,
  UploadCourseImageRequest,
} from "@/types/courses/course.payload";
import {
  CreateCourseResponse,
  DeleteCourseImageResponse,
  DeleteCourseResponse,
  GetAvailableCoursesResponse,
  GetCourseByIdResponse,
  GetCourseEnrollmentsResponse,
  GetMyCoursesResponse,
  InactivateCourseResponse,
  UpdateAccessCodeResponse,
  UpdateCourseResponse,
  UploadCourseImageResponse,
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

  /** PUT /api/Courses/{id}/inactivate (Lecturer only - own courses) */
inactivateCourse: async (
  id: string,
  data: InactivateCoursePayload
): Promise<InactivateCourseResponse> => {
  const res = await courseAxiosInstance.put<InactivateCourseResponse>(
    `/Courses/${id}/inactivate`,
    data
  );
  return res.data;
},

/** 🆕 POST /api/Courses/{courseId}/upload-image (Lecturer only) */
  uploadCourseImage: async ({
    courseId,
    image,
  }: UploadCourseImageRequest): Promise<UploadCourseImageResponse> => {
    const formData = new FormData();
    formData.append("image", image);

    const res = await courseAxiosInstance.post<UploadCourseImageResponse>(
      `/Courses/${courseId}/upload-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  deleteCourseImage: async ({
    courseId,
  }: DeleteCourseImageRequest): Promise<DeleteCourseImageResponse> => {
    const res = await courseAxiosInstance.delete<DeleteCourseImageResponse>(
      `/Courses/${courseId}/image`
    );
    return res.data;
  },
};
