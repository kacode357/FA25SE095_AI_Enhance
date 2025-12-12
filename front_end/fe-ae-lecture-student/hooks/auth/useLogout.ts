// hooks/auth/useLogout.ts
"use client";

import { useState, useCallback } from "react";
import { AuthService } from "@/services/auth.services";
import type { LogoutPayload } from "@/types/auth/auth.payload";
import type { ApiResponse, LogoutResponse } from "@/types/auth/auth.response";
import { clearAuthTokens } from "@/utils/auth/access-token";
import { clearEncodedUser } from "@/utils/secure-user";

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
        clearAuthTokens();
        clearEncodedUser();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return data;
      } catch {
        // Trong mọi trường hợp lỗi vẫn clear session + cookie và về /login
        clearAuthTokens();
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
