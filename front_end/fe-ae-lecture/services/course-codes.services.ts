// services/course-codes.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  CreateCourseCodePayload,
  UpdateCourseCodePayload,
  GetCourseCodesQuery,
} from "@/types/course-codes/course-codes.payload";
import {
  CreateCourseCodeResponse,
  GetCourseCodesResponse,
  GetCourseCodeByIdResponse,
  UpdateCourseCodeResponse,
  DeleteCourseCodeResponse,
} from "@/types/course-codes/course-codes.response";

export const CourseCodeService = {
  // POST /api/CourseCodes
  create: async (data: CreateCourseCodePayload): Promise<CreateCourseCodeResponse> => {
    const response = await courseAxiosInstance.post<CreateCourseCodeResponse>("/CourseCodes", data);
    return response.data;
  },

  // GET /api/CourseCodes
  getAll: async (params?: GetCourseCodesQuery): Promise<GetCourseCodesResponse> => {
    const response = await courseAxiosInstance.get<GetCourseCodesResponse>("/CourseCodes", {
      params,
    });
    return response.data;
  },

  // GET /api/CourseCodes/{id}
  getById: async (id: string): Promise<GetCourseCodeByIdResponse> => {
    const response = await courseAxiosInstance.get<GetCourseCodeByIdResponse>(`/CourseCodes/${id}`);
    return response.data;
  },

  // PUT /api/CourseCodes/{id}
  update: async (id: string, data: UpdateCourseCodePayload): Promise<UpdateCourseCodeResponse> => {
    const response = await courseAxiosInstance.put<UpdateCourseCodeResponse>(`/CourseCodes/${id}`, data);
    return response.data;
  },

  // DELETE /api/CourseCodes/{id}
  delete: async (id: string): Promise<DeleteCourseCodeResponse> => {
    const response = await courseAxiosInstance.delete<DeleteCourseCodeResponse>(`/CourseCodes/${id}`);
    return response.data;
  },
};
