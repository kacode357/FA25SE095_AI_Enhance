// services/user.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import type { ApiResponse } from "@/types/auth/auth.response";
import type { UpdateProfilePayload, UploadAvatarPayload } from "@/types/user/user.payload";
import type { UpdateProfileResponse, UploadAvatarResponse, UserProfile } from "@/types/user/user.response";

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

  uploadAvatar: async (
  payload: UploadAvatarPayload
): Promise<UploadAvatarResponse> => {
  const formData = new FormData();
  formData.append("ProfilePicture", payload.ProfilePicture);

  const res = await userAxiosInstance.post<UploadAvatarResponse>(
    "/User/profile/picture",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data;
},
};
