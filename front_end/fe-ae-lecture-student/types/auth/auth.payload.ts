export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: number;
  phoneNumber?: string;
  institutionName?: string;
  institutionEmail?: string;
  department?: string;
  position?: string;
  studentId?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
  captchaToken?: string;
}

export interface ConfirmEmailPayload {
  token: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface LogoutPayload {
  userId: string;
  accessToken: string;
  logoutAllDevices: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordRequest extends ChangePasswordPayload {
  userId: string;
}

export interface GoogleLoginPayload {
  googleIdToken: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
}
