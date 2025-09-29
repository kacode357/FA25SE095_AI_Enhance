// services/auth.services.ts
import { defaultAxiosInstance } from "@/config/axios.config";
import { 
  LoginPayload, 
  RegisterPayload, 
  ConfirmEmailPayload, 
  RefreshTokenPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/auth/auth.payload";
import { 
  LoginResponse, 
  RegisterResponse, 
  ConfirmEmailResponse, 
  RefreshTokenResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse, 
} from "@/types/auth/auth.response";

export const AuthService = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await defaultAxiosInstance.post<LoginResponse>("/Auth/login", data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await defaultAxiosInstance.post<RegisterResponse>("/Auth/register", data);
    return response.data;
  },

  confirmEmail: async (data: ConfirmEmailPayload): Promise<ConfirmEmailResponse> => {
    const response = await defaultAxiosInstance.post<ConfirmEmailResponse>("/Auth/confirm-email", data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenPayload): Promise<RefreshTokenResponse> => {
    const response = await defaultAxiosInstance.post<RefreshTokenResponse>("/Auth/refresh-token", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await defaultAxiosInstance.post<ForgotPasswordResponse>("/Auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await defaultAxiosInstance.post<ResetPasswordResponse>("/Auth/reset-password", data);
    return response.data;
  },
};
