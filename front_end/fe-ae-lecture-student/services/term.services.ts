// services/term.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import { GetTermsDropdownPayload } from "@/types/term/term.payload";
import { GetTermsDropdownResponse } from "@/types/term/term.response";

export const TermService = {
  // GET /Terms/dropdown (cũ – dùng cho dropdown đơn giản)
  getAll: async (
    _params?: GetTermsDropdownPayload
  ): Promise<GetTermsDropdownResponse> => {
    const res = await courseAxiosInstance.get<GetTermsDropdownResponse>(
      "/Terms/dropdown"
    );
    return res.data;
  },

  // ✅ NEW: GET /Terms (filter + pagination)
  getPaged: async (
    params?: GetTermsDropdownPayload
  ): Promise<GetTermsDropdownResponse> => {
    const res = await courseAxiosInstance.get<GetTermsDropdownResponse>(
      "/Terms",
      {
        params: {
          // default để khớp swagger
          page: 1,
          pageSize: 10,
          sortBy: "Name",
          sortDirection: "asc",
          ...params,
        },
      }
    );
    return res.data;
  },
};
