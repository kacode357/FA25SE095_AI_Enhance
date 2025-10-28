// services/access-code.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import { GetAccessCodePayload } from "@/types/access-code/access-code.payload";
import { GetAccessCodeResponse } from "@/types/access-code/access-code.response";

export const AccessCodeService = {
    
  /** ✅ GET /api/Courses/{id}/access-code */
  getAccessCode: async (payload: GetAccessCodePayload): Promise<GetAccessCodeResponse> => {
    const { courseId } = payload;
    const res = await courseAxiosInstance.get<GetAccessCodeResponse>(
      `/Courses/${courseId}/access-code`
    );
    return res.data;
  },
};
