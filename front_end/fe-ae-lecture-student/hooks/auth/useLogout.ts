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

function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  console.log("[auth] tokens cleared (cookies + sessionStorage)");
}

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(
    async (payload?: LogoutPayload): Promise<LogoutResponse | null> => {
      setLoading(true);
      try {
        let data: LogoutResponse | null = null;

        if (typeof AuthService.logout === "function") {
          const res = (await AuthService.logout(payload as LogoutPayload)) as unknown;

          if (
            res &&
            typeof res === "object" &&
            "data" in (res as Record<string, unknown>) &&
            "status" in (res as Record<string, unknown>)
          ) {
            const env = res as ApiResponse<LogoutResponse>;
            console.log("[auth] logout:", env.status, env.message);
            data = env.data;
          } else {
            data = (res as LogoutResponse) ?? null;
          }
        }

        // Clear token + clear encrypted user (a:u) rồi điều hướng
        clearTokens();
        clearEncodedUser();

        if (typeof window !== "undefined") window.location.href = "/login";

        return data;
      } catch (err) {
        console.error("[auth] logout error:", err);
        clearTokens();
        clearEncodedUser();
        if (typeof window !== "undefined") window.location.href = "/login";
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { logout, loading };
}
