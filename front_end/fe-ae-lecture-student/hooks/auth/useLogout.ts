// hooks/auth/useLogout.ts
"use client";

import { useState, useCallback } from "react";
import { AuthService } from "@/services/auth.services";
import type { LogoutPayload } from "@/types/auth/auth.payload";
import type { LogoutResponse } from "@/types/auth/auth.response";
import { useAuth } from "@/contexts/AuthContext";

const broadcast = (reason: "logout") => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("auth:broadcast", JSON.stringify({ at: Date.now(), reason }));
    } catch {}
  }
};

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const { logout: ctxLogout } = useAuth();

  const logout = useCallback(
    async (payload?: LogoutPayload): Promise<LogoutResponse | null> => {
      setLoading(true);
      try {
        const res = await (AuthService.logout?.(payload as LogoutPayload) ?? Promise.resolve(null))
          .catch(() => null);

        // Clear + redirect qua AuthContext
        ctxLogout();

        // Broadcast đa tab (và là dấu vết hợp lệ)
        broadcast("logout");

        return res;
      } catch {
        try { ctxLogout(); } catch {}
        broadcast("logout");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [ctxLogout]
  );

  return { logout, loading };
}
