// hooks/auth/useLogout.ts
"use client";

import { useState, useCallback } from "react";
import { AuthService } from "@/services/auth.services";
import { LogoutPayload } from "@/types/auth/auth.payload";
import { LogoutResponse } from "@/types/auth/auth.response";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const logout = useCallback(
    async (payload: LogoutPayload): Promise<LogoutResponse | null> => {
      setLoading(true);
      try {
        const res = await AuthService.logout(payload).catch(() => null);

        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("just_logged_in"); // ✅ dọn cờ
        }
        setUser(null);

        router.replace("/login");
        return res;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router, setUser]
  );

  return { logout, loading };
}
