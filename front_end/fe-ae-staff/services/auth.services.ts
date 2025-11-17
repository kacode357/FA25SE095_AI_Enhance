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
  ChangePasswordRequest,
  GoogleLoginPayload,
} from "@/types/auth/auth.payload";
import type {
  ApiResponse,           // <-- dùng khung response chuẩn
  ConfirmEmailResponse,
  ForgotPasswordResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  GoogleLoginResponse,
} from "@/types/auth/auth.response";

/**
 * LƯU Ý:
 * - Backend đã đổi /Auth/login trả về { status, message, data }.
 * - Các endpoint còn lại giữ nguyên shape cũ (trả trực tiếp payload),
 *   trừ khi bạn đã đổi backend cho chúng.
 */
export const AuthService = {
  /** POST /Auth/login — trả về ApiResponse<LoginResponse> */
  login: async (data: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const response = await userAxiosInstance.post<ApiResponse<LoginResponse>>(
      "/Auth/login",
      data
    );
    return response.data; // { status, message, data }
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

  /** POST /Auth/change-password */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await userAxiosInstance.post<ChangePasswordResponse>("/Auth/change-password", data);
    return response.data;
  },

  logout: async (data: LogoutPayload): Promise<LogoutResponse> => {
    const response = await userAxiosInstance.post<LogoutResponse>("/Auth/logout", data);
    return response.data;
  },
  googleLogin: async (
    data: GoogleLoginPayload
  ): Promise<ApiResponse<GoogleLoginResponse>> => {
    const response = await userAxiosInstance.post<ApiResponse<GoogleLoginResponse>>(
      "/Auth/google-login",
      data
    );
    return response.data;
  },
};
