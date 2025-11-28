// services/lecturer.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import type { GetLecturersQuery } from "@/types/lecturers/lecturer.payload";
import type { GetLecturersResponse } from "@/types/lecturers/lecturer.response";

export const LecturerService = {
  /** GET /api/Lecturers */
  getLecturers: async (
    params?: GetLecturersQuery
  ): Promise<GetLecturersResponse> => {
    const res = await userAxiosInstance.get<GetLecturersResponse>("/Lecturers", {
      params: {
        // Map đúng tên query param theo swagger
        SearchTerm: params?.searchTerm,
        Page: params?.page,
        PageSize: params?.pageSize,
      },
    });

    return res.data;
  },
};
