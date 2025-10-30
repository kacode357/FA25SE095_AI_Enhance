// types/auth/auth.response.ts

/** Khung response chuẩn bọc dữ liệu từ server */
export type ApiResponse<T> = {
  status: number;      // ví dụ: 200
  message: string;     // ví dụ: "Login successful"
  data: T;             // payload thật sự
};

export interface RegisterResponse {
  userId: string;
  email: string;
  requiresEmailConfirmation: boolean;
  requiresApproval: boolean;
  message: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier: string;
  accessToken: string;
  refreshToken: string;
  tokenExpires: string;
  crawlQuotaUsed: number;
  crawlQuotaLimit: number;
  quotaResetDate: string;
  requiresEmailConfirmation: boolean;
  requiresApproval: boolean;
}

export interface ConfirmEmailResponse {
  success: boolean;
  message: string;
  requiresApproval: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenExpires: string;
  userId: string;
  email: string;
  role: string;
  subscriptionTier: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
