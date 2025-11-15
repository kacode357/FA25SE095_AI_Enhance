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

const ACCESS_TOKEN_EXPIRES_DAYS = 1 / 24; // ~1 giờ

export function getSavedAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  // Ưu tiên cookie trước (remember me)
  const cookieToken = Cookies.get(ACCESS_TOKEN_KEY);
  if (cookieToken) return cookieToken;

  // Nếu không có cookie thì thử sessionStorage (login thường)
  const sessionToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return sessionToken || null;
}

export function getSavedRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = Cookies.get(REFRESH_TOKEN_KEY);
  return token || null;
}

export function getRememberMeFlag(): boolean {
  if (typeof window === "undefined") return false;
  return Cookies.get(REMEMBER_ME_KEY) === "1";
}

/**
 * Lưu token sau khi login lần đầu
 * - rememberMe = true  -> access + refresh đều cookie, refresh 30 ngày
 * - rememberMe = false -> access dùng sessionStorage, refresh token cookie 7 ngày
 */
export function saveTokensFromLogin(
  accessToken: string,
  refreshToken: string | null | undefined,
  rememberMe: boolean
) {
  if (typeof window === "undefined") return;

  // clear trước cho sạch
  clearAuthTokens();

  // nhớ kiểu login
  Cookies.set(REMEMBER_ME_KEY, rememberMe ? "1" : "0", {
    ...BASE_COOKIE_OPTS,
    expires: rememberMe ? 30 : 7,
  });

  if (rememberMe) {
    if (accessToken) {
      Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
        ...BASE_COOKIE_OPTS,
        expires: ACCESS_TOKEN_EXPIRES_DAYS,
      });
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...BASE_COOKIE_OPTS,
        expires: 30,
      });
    }
    // xoá session cho chắc
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    // login thường: access để session, refresh để cookie 7 ngày
    if (accessToken) {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...BASE_COOKIE_OPTS,
        expires: 7,
      });
    }
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  }
}

/**
 * Cập nhật access token khi refresh
 * - Nếu rememberMe -> luôn để cookie 1 giờ
 * - Nếu không      -> luôn để sessionStorage
 */
export function updateAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;
  const rememberMe = getRememberMeFlag();

  if (rememberMe) {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      ...BASE_COOKIE_OPTS,
      expires: ACCESS_TOKEN_EXPIRES_DAYS,
    });
  } else {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  }
}

/**
 * Cập nhật refresh token khi refresh
 * TTL:
 * - rememberMe = true  -> 30 ngày
 * - rememberMe = false -> 7 ngày
 */
export function updateRefreshToken(refreshToken: string) {
  if (typeof window === "undefined") return;
  const rememberMe = getRememberMeFlag();
  const expires = rememberMe ? 30 : 7;

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...BASE_COOKIE_OPTS,
    expires,
  });
}

export function clearAuthTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  Cookies.remove(REMEMBER_ME_KEY, { path: "/" });

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
