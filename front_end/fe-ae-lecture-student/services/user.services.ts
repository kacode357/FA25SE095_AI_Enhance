// services/user.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import type { ApiResponse } from "@/types/auth/auth.response";
import type { UserProfile, UpdateProfileResponse } from "@/types/user/user.response";
import type { UpdateProfilePayload } from "@/types/user/user.payload";

/**
 * Lưu ý:
 * - Backend hiện trả về dạng bọc { status, message, data } cho /User/profile (GET/PUT).
 * - Hàm dưới đây phản ánh đúng kiểu đó để code phía trên dùng thống nhất.
 */
export const UserService = {
  /** GET /User/profile */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await userAxiosInstance.get<ApiResponse<UserProfile>>("/User/profile");
    return res.data; 
  },

  /** PUT /User/profile */
  updateProfile: async (
    data: UpdateProfilePayload
  ): Promise<ApiResponse<UpdateProfileResponse>> => {
    const res = await userAxiosInstance.put<ApiResponse<UpdateProfileResponse>>(
      "/User/profile",
      data
    );
    return res.data; 
  },
};
