// services/terms.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
  CreateTermPayload,
  UpdateTermPayload,
  GetTermsQuery,
} from "@/types/terms/terms.payload";
import {
  CreateTermResponse,
  GetTermsResponse,
  UpdateTermResponse,
  GetTermByIdResponse,
  GetTermDropdownResponse,
  DeleteTermResponse,
} from "@/types/terms/terms.response";

export const TermService = {
  /** POST /api/Terms - Tạo term mới (Staff only) */
  create: async (data: CreateTermPayload): Promise<CreateTermResponse> => {
    const response = await courseAxiosInstance.post<CreateTermResponse>("/Terms", data);
    return response.data;
  },

  /** GET /api/Terms - Lấy tất cả term (public) */
  getAll: async (params?: GetTermsQuery): Promise<GetTermsResponse> => {
    const response = await courseAxiosInstance.get<GetTermsResponse>("/Terms", { params });
    return response.data;
  },

  /** GET /api/Terms/{id} - Lấy chi tiết term */
  getById: async (id: string): Promise<GetTermByIdResponse> => {
    const response = await courseAxiosInstance.get<GetTermByIdResponse>(`/Terms/${id}`);
    return response.data;
  },

  /** PUT /api/Terms/{id} - Cập nhật term */
  update: async (id: string, data: UpdateTermPayload): Promise<UpdateTermResponse> => {
    const response = await courseAxiosInstance.put<UpdateTermResponse>(`/Terms/${id}`, data);
    return response.data;
  },

  /** DELETE /api/Terms/{id} - Xoá term (nếu API có hỗ trợ, dự phòng) */
  delete: async (id: string): Promise<DeleteTermResponse> => {
    const response = await courseAxiosInstance.delete<DeleteTermResponse>(`/Terms/${id}`);
    return response.data;
  },

  /** GET /api/Terms/dropdown - Lấy danh sách term active cho dropdown */
  getDropdown: async (): Promise<GetTermDropdownResponse> => {
    const response = await courseAxiosInstance.get<GetTermDropdownResponse>("/Terms/dropdown");
    return response.data;
  },
  
};
