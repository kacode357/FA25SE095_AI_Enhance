// utils/auth/access-token.ts
"use client";

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";

export function getSavedAccessToken(): string {
  // 1. Ưu tiên sessionStorage (rememberMe = false)
  if (typeof window !== "undefined") {
    const ss = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (ss) return ss;
  }

  // 2. Nếu không có thì lấy từ cookie (rememberMe = true)
  const ck = Cookies.get(ACCESS_TOKEN_KEY);
  return ck || "";
}
