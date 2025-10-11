// services/user.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import { UserProfile, UpdateProfileResponse } from "@/types/user/user.response";
import { UpdateProfilePayload } from "@/types/user/user.payload";

export const UserService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await userAxiosInstance.get<UserProfile>("/User/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
    const response = await userAxiosInstance.put<UpdateProfileResponse>("/User/profile", data);
    return response.data;
  },
};
