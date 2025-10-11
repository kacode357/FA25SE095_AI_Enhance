// Authentication and authorization shared types

export type Role = "student" | "lecturer" | "paid_user" | "admin";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  roles: Role[];
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

// JWT claims carried by access tokens
export interface JwtClaims {
  sub: string; // user id
  email: string;
  roles: Role[];
  iat: number; // issued at (seconds)
  exp: number; // expiry (seconds)
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
}

// Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Responses
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  tokens: AuthTokens;
}
