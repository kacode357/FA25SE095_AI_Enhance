// services/auth.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import {
  ChangePasswordRequest,
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  LogoutPayload,
  RefreshTokenPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth/auth.payload";
import type {
  ApiResponse,
  ChangePasswordResponse, // <-- dùng khung response chuẩn
  ConfirmEmailResponse,
  ForgotPasswordResponse,
  GoogleLoginResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
  ResetPasswordResponse,
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
    const response = await userAxiosInstance.post<ApiResponse<LoginResponse>>("/Auth/login", data, {
      // Caller: login flow should not trigger global toasts from interceptors
      suppressToast: true,
    });
    return response.data; // { status, message, data }
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await userAxiosInstance.post<RegisterResponse>("/Auth/register", data);

    // If backend returned a non-success status, throw the whole response so callers
    // stay on the page and the response interceptor can show the BE-provided toast.
    if (response.status >= 400) {
      throw response;
    }

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
    const response = await userAxiosInstance.post<any>("/Auth/forgot-password", data);

    const respData = response.data;

    if (respData && typeof respData === "object" && "status" in respData && "message" in respData) {
      const statusNum = Number(respData.status ?? 0);
      return {
        success: statusNum >= 200 && statusNum < 300,
        message: String(respData.message ?? ""),
      } as ForgotPasswordResponse;
    }

    // Fallback: assume response.data already matches ForgotPasswordResponse
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
    const response = await userAxiosInstance.post<LogoutResponse>("/Auth/logout", data, {
      suppressToast: true,
    });
    return response.data;
  },
  googleLogin: async (
    data: GoogleLoginPayload
  ): Promise<ApiResponse<GoogleLoginResponse>> => {
    const response = await userAxiosInstance.post<ApiResponse<GoogleLoginResponse>>(
      "/Auth/google-login",
      data,
      { suppressToast: true }
    );
    return response.data;
  },
};
