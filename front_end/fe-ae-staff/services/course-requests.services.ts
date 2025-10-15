// services/course-requests.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  GetCourseRequestsQuery,
  ProcessCourseRequestPayload,
} from "@/types/course-requests/course-requests.payload";
import {
  GetCourseRequestsResponse,
  GetCourseRequestByIdResponse,
  ProcessCourseRequestResponse,
} from "@/types/course-requests/course-requests.response";

export const CourseRequestService = {
  // GET /api/CourseRequests
  getAll: async (
    params?: GetCourseRequestsQuery
  ): Promise<GetCourseRequestsResponse> => {
    const response = await courseAxiosInstance.get<GetCourseRequestsResponse>(
      "/CourseRequests",
      { params }
    );
    return response.data;
  },

  // ✅ GET /api/CourseRequests/{id}
  getById: async (id: string): Promise<GetCourseRequestByIdResponse> => {
    const response = await courseAxiosInstance.get<GetCourseRequestByIdResponse>(
      `/CourseRequests/${id}`
    );
    return response.data;
  },

  // ✅ PUT /api/CourseRequests/{id}/process
  process: async (
    id: string,
    payload: ProcessCourseRequestPayload
  ): Promise<ProcessCourseRequestResponse> => {
    const response = await courseAxiosInstance.put<ProcessCourseRequestResponse>(
      `/CourseRequests/${id}/process`,
      payload
    );
    return response.data;
  },
};
