import { courseAxiosInstance } from "@/config/axios.config";
import { CourseRequestPayload, GetMyCourseRequestsQuery } from "@/types/course-requests/course-request.payload";
import { CourseRequestResponse, GetMyCourseRequestsResponse } from "@/types/course-requests/course-request.response";

export const CourseRequestService = {
  // POST /api/CourseRequests
  create: async (data: CourseRequestPayload): Promise<CourseRequestResponse> => {
    const formData = new FormData();

    formData.append("courseCodeId", data.courseCodeId);
    formData.append("description", data.description);
    formData.append("term", data.term);
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
    const res = await courseAxiosInstance.get<GetMyCourseRequestsResponse>(
      "/CourseRequests/my-requests",
      { params }
    );
    return res.data;
  },
};
