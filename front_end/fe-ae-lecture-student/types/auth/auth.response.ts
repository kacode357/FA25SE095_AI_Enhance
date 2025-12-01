export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
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

// Backend for forgot-password returns an ApiResponse wrapper
// Example: { status: 200, message: "...", data: null }
// Keep backward compatibility with legacy { success, message } shape.
export type ForgotPasswordResponse =
  | ApiResponse<null>
  | {
      success: boolean;
      message: string;
    };

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Backend may return ApiResponse wrapper for some endpoints.
export type ChangePasswordResponse =
  | ApiResponse<null>
  | {
      success: boolean;
      message: string;
    };

export type GoogleLoginResponse = LoginResponse;
