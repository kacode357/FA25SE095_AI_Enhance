// utils/auth/access-token.ts
"use client";

import Cookies from "js-cookie";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
const REMEMBER_ME_KEY = "rememberMe";
const REMEMBER_ME_EXPIRES_DAYS = 7;
const SHORT_SESSION_MINUTES = 30;
const SHORT_SESSION_EXPIRES_DAYS = SHORT_SESSION_MINUTES / (24 * 60);

const BASE_COOKIE_OPTS = {
  secure: true,
  sameSite: "strict" as const,
  path: "/" as const,
};

function cookieOpts(rememberMe: boolean) {
  return {
    ...BASE_COOKIE_OPTS,
    expires: rememberMe ? REMEMBER_ME_EXPIRES_DAYS : SHORT_SESSION_EXPIRES_DAYS,
  };
}

function persistRememberFlag(rememberMe: boolean) {
  Cookies.set(REMEMBER_ME_KEY, rememberMe ? "1" : "0", cookieOpts(rememberMe));
}

/** Lấy access token (cookie) */
export function getSavedAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

/** Lấy refresh token từ cookie (ONLY FROM COOKIE) */
export function getSavedRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}

export function getRememberMeFlag(): boolean {
  if (typeof window === "undefined") return false;
  return Cookies.get(REMEMBER_ME_KEY) === "1";
}

/**
 * Persist tokens khi login.
 * - rememberMe = true  -> giữ cả access + refresh cookie (7 ngày)
 * - rememberMe = false -> chỉ giữ access token (30 phút), refresh bị xóa
 */
export function saveTokensFromLogin(
  accessToken: string,
  refreshToken: string | null | undefined,
  rememberMe: boolean
) {
  if (typeof window === "undefined") return;

  clearAuthTokens();

  if (!accessToken && !refreshToken) return;

  persistRememberFlag(rememberMe);
  const opts = cookieOpts(rememberMe);

  if (accessToken) {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, opts);
  }
  if (rememberMe && refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, opts);
  } else {
    Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  }
}

/**
 * Update access token khi refresh
 * - rememberMe = true  → cookie (7 ngày)
 * - rememberMe = false → cookie (30 phút)
 */
export function updateAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;

  const rememberMe = getRememberMeFlag();
  persistRememberFlag(rememberMe);
  const opts = cookieOpts(rememberMe);

  Cookies.set(ACCESS_TOKEN_KEY, accessToken, opts);
}

/**
 * Update refresh token khi refresh
 * - cookie, theo rememberMe để set expiry
 */
export function updateRefreshToken(refreshToken: string) {
  if (typeof window === "undefined") return;

  const rememberMe = getRememberMeFlag();
  persistRememberFlag(rememberMe);
  const opts = cookieOpts(rememberMe);

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, opts);
}

/** Clear cả access + refresh + remember */
export function clearAuthTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  Cookies.remove(REMEMBER_ME_KEY, { path: "/" });

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
