// services/user.services.ts
import { defaultAxiosInstance } from "@/config/axios.config";
import { UserProfile } from "@/types/user/user.response";

export const UserService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await defaultAxiosInstance.get<UserProfile>("/User/profile");
    return response.data;
  },
};
