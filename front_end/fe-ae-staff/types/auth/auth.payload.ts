// types/auth/auth.payload.ts

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

