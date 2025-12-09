import { courseAxiosInstance } from "@/config/axios.config";
import { CourseRequestPayload, GetMyCourseRequestsQuery } from "@/types/course-requests/course-request.payload";
import {
  CourseRequestResponse,
  DeleteSyllabusResponse,
  GetCourseRequestByIdResponse,
  GetMyCourseRequestsResponse,
  UploadSyllabusResponse,
} from "@/types/course-requests/course-request.response";

export const CourseRequestService = {
  // POST /api/CourseRequests
  create: async (data: CourseRequestPayload): Promise<CourseRequestResponse> => {
    const formData = new FormData();

    formData.append("courseCodeId", data.courseCodeId);
    formData.append("description", data.description);
    formData.append("termId", data.termId);
    formData.append("year", data.year.toString());

    if (data.requestReason) {
      formData.append("requestReason", data.requestReason);
    }

    if (data.studentEnrollmentFile) {
      formData.append("studentEnrollmentFile", data.studentEnrollmentFile);
    }

    if (data.lecturerId) {
      formData.append("lecturerId", data.lecturerId);
    }

    const response = await courseAxiosInstance.post<CourseRequestResponse>("/CourseRequests", formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );

    return response.data;
  },

  // GET /api/CourseRequests/my-requests
  getAll: async (
    params: GetMyCourseRequestsQuery
  ): Promise<GetMyCourseRequestsResponse> => {
    const res = await courseAxiosInstance.get<GetMyCourseRequestsResponse>("/CourseRequests/my-requests",
      { params }
    );
    return res.data;
  },

    // ✅ GET /api/CourseRequests/{id}
  getById: async (id: string): Promise<GetCourseRequestByIdResponse> => {
    const response = await courseAxiosInstance.get<GetCourseRequestByIdResponse>(
      `/CourseRequests/${id}`
    );
    return response.data;
  },

  // POST /api/CourseRequests/{courseRequestId}/syllabus/upload
  uploadSyllabus: async (
    courseRequestId: string,
    file: File
  ): Promise<UploadSyllabusResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await courseAxiosInstance.post<UploadSyllabusResponse>(
      `/CourseRequests/${courseRequestId}/syllabus/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  },

  // DELETE /api/CourseRequests/{courseRequestId}/syllabus
  deleteSyllabus: async (courseRequestId: string): Promise<DeleteSyllabusResponse> => {
    const res = await courseAxiosInstance.delete<DeleteSyllabusResponse>(
      `/CourseRequests/${courseRequestId}/syllabus`
    );
    return res.data;
  },
};
