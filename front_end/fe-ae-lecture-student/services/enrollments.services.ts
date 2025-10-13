// services/enrollments.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  ImportEnrollmentsPayload,
} from "@/types/enrollments/enrollments.payload";
import {
  ImportEnrollmentsResponse,
} from "@/types/enrollments/enrollments.response";

export const EnrollmentsService = {
  importEnrollments: async (
    data: ImportEnrollmentsPayload
  ): Promise<ImportEnrollmentsResponse> => {
    const formData = new FormData();

    // Gửi cả hai key để BE nào cũng nhận được
    formData.append("ExcelFile", data.file);
    formData.append("file", data.file);

    // Optional: include selected course IDs (support both lowercase and PascalCase keys)
    if (data.courseIds && data.courseIds.length > 0) {
      // Common conventions: repeat the key for each value or send as JSON string. We'll do both for compatibility.
      data.courseIds.forEach((id) => {
        formData.append("courseIds", id);
        formData.append("CourseIds", id);
      });
      formData.append("courseIdsJson", JSON.stringify(data.courseIds));
      formData.append("CourseIdsJson", JSON.stringify(data.courseIds));
    }

    const response = await courseAxiosInstance.post<ImportEnrollmentsResponse>(
      "/enrollments/import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  },
};

