// services/auth.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import {
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LogoutPayload,
  RefreshTokenPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ChangePasswordRequest, // <— thêm
} from "@/types/auth/auth.payload";
import {
  ConfirmEmailResponse,
  ForgotPasswordResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
  ResetPasswordResponse,
  ChangePasswordResponse, // <— thêm
} from "@/types/auth/auth.response";

export const AuthService = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await userAxiosInstance.post<LoginResponse>("/Auth/login", data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await userAxiosInstance.post<RegisterResponse>("/Auth/register", data);
    return response.data;
  },

  confirmEmail: async (data: ConfirmEmailPayload): Promise<ConfirmEmailResponse> => {
    const response = await userAxiosInstance.post<ConfirmEmailResponse>("/Auth/confirm-email", data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenPayload): Promise<RefreshTokenResponse> => {
    const response = await userAxiosInstance.post<RefreshTokenResponse>("/Auth/refresh-token", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await userAxiosInstance.post<ForgotPasswordResponse>("/Auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await userAxiosInstance.post<ResetPasswordResponse>("/Auth/reset-password", data);
    return response.data;
  },

  /** POST /api/Auth/change-password */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await userAxiosInstance.post<ChangePasswordResponse>("/Auth/change-password", data);
    return response.data;
  },

  logout: async (data: LogoutPayload): Promise<LogoutResponse> => {
    const response = await userAxiosInstance.post<LogoutResponse>("/Auth/logout", data);
    return response.data;
  },
};
