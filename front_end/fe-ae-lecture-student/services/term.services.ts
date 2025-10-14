import { courseAxiosInstance } from "@/config/axios.config";
import { GetTermsDropdownPayload } from "@/types/term/term.payload";
import { GetTermsDropdownResponse } from "@/types/term/term.response";

export const TermService = {
  // GET /Terms/dropdown
  getAll: async (
    _params?: GetTermsDropdownPayload
  ): Promise<GetTermsDropdownResponse> => {
    const res = await courseAxiosInstance.get<GetTermsDropdownResponse>("/Terms/dropdown");
    return res.data;
  },
};
