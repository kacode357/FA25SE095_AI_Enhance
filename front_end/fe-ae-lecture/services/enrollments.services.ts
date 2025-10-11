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

