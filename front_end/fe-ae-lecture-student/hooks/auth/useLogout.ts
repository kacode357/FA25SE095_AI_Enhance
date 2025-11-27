// hooks/auth/useLogout.ts
"use client";

import { useState, useCallback } from "react";
import Cookies from "js-cookie";
import { AuthService } from "@/services/auth.services";
import type { LogoutPayload } from "@/types/auth/auth.payload";
import type { ApiResponse, LogoutResponse } from "@/types/auth/auth.response";
import { clearEncodedUser } from "@/utils/secure-user";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const REMEMBER_ME = "rememberMe";
// Xóa toàn bộ token ở cookie + sessionStorage
function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  Cookies.remove(REMEMBER_ME, { path: "/" });

  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(
    async (payload?: LogoutPayload): Promise<LogoutResponse | null> => {
      setLoading(true);
      try {
        let data: LogoutResponse | null = null;

        if (typeof AuthService.logout === "function" && payload) {
          const res = (await AuthService.logout(payload)) as unknown;

          // chấp nhận cả dạng ApiResponse<LogoutResponse> lẫn LogoutResponse thuần
          if (
            res &&
            typeof res === "object" &&
            "data" in (res as Record<string, unknown>) &&
            "status" in (res as Record<string, unknown>)
          ) {
            data = (res as ApiResponse<LogoutResponse>).data;
          } else {
            data = (res as LogoutResponse) ?? null;
          }
        }

        // Logout = clear token + clear user + về /login
        clearTokens();
        clearEncodedUser();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return data;
      } catch {
        // Trong mọi trường hợp lỗi vẫn clear session + cookie và về /login
        clearTokens();
        clearEncodedUser();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { logout, loading };
}
