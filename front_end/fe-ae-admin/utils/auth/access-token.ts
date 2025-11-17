// utils/auth/access-token.ts
"use client";

import Cookies from "js-cookie";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
const REMEMBER_ME_KEY = "rememberMe";

const BASE_COOKIE_OPTS = {
  secure: true,
  sameSite: "strict" as const,
  path: "/" as const,
};

/** Lấy access token (cookie ưu tiên, fallback sessionStorage) */
export function getSavedAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const cookieToken = Cookies.get(ACCESS_TOKEN_KEY);
  if (cookieToken) return cookieToken;

  const sessionToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return sessionToken || null;
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
 * Lưu token khi login
 * - rememberMe = true  -> access + refresh đều cookie
 * - rememberMe = false -> access = session, KHÔNG giữ refreshToken cookie
 */
export function saveTokensFromLogin(
  accessToken: string,
  refreshToken: string | null | undefined,
  rememberMe: boolean
) {
  if (typeof window === "undefined") return;

  clearAuthTokens();

  // lưu cờ rememberMe
  Cookies.set(REMEMBER_ME_KEY, rememberMe ? "1" : "0", {
    ...BASE_COOKIE_OPTS,
  });

  // ===== CASE REMEMBER ME = TRUE → token nằm ở cookie =====
  if (rememberMe) {
    if (accessToken) {
      Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
        ...BASE_COOKIE_OPTS,
      });
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...BASE_COOKIE_OPTS,
      });
    }

    // xoá session cho chắc
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  // ===== CASE LOGIN THƯỜNG (KHÔNG REMEMBER ME) =====
  // accessToken chỉ để trong session
  if (accessToken) {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  // không giữ refreshToken trong cookie
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });

  // accessToken không để cookie
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
}

/**
 * Update access token khi refresh
 * - rememberMe = true  → cookie
 * - rememberMe = false → sessionStorage
 */
export function updateAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;

  const rememberMe = getRememberMeFlag();

  if (rememberMe) {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      ...BASE_COOKIE_OPTS,
    });
  } else {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  }
}

/**
 * Update refresh token khi refresh
 * - chỉ giữ refreshToken nếu rememberMe = true
 */
export function updateRefreshToken(refreshToken: string) {
  if (typeof window === "undefined") return;

  const rememberMe = getRememberMeFlag();

  if (!rememberMe) {
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
    return;
  }

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...BASE_COOKIE_OPTS,
  });
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
