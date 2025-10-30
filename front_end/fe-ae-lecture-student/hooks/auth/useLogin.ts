// hooks/auth/useLogin.ts
"use client";

import { mapRole, UserRole, isAllowedAppRole } from "@/config/classroom-service/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { LoginPayload } from "@/types/auth/auth.payload";
import type { LoginResponse, ApiResponse } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import Cookies from "js-cookie";
import { useState } from "react";

type LoginOptions = {
  remember?: boolean;
};

export type LoginResult = {
  ok: boolean;
  data: LoginResponse | null;
  role: UserRole | null;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const COMMON_COOKIE_OPTS = {
  secure: true,
  sameSite: "strict" as const,
  path: "/",
};

const expiresInMs = (ms: number) => new Date(Date.now() + ms);

const broadcast = (reason: "login" | "refresh" | "logout") => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("auth:broadcast", JSON.stringify({ at: Date.now(), reason }));
    } catch {}
  }
};

const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const setSession = (accessToken: string, refreshToken?: string, remember?: boolean) => {
    if (remember) {
      Cookies.set(ACCESS_TOKEN_KEY, accessToken, { ...COMMON_COOKIE_OPTS, expires: 7 });
      if (refreshToken) {
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { ...COMMON_COOKIE_OPTS, expires: 7 });
      }
    } else {
      const shortExpire = expiresInMs(30 * 60 * 1000);
      Cookies.set(ACCESS_TOKEN_KEY, accessToken, { ...COMMON_COOKIE_OPTS, expires: shortExpire });
      if (refreshToken) {
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { ...COMMON_COOKIE_OPTS, expires: shortExpire });
      }
    }
  };

  const login = async (
    payload: LoginPayload,
    options: LoginOptions = {}
  ): Promise<LoginResult> => {
    const { remember = false } = options;
    setLoading(true);

    try {
      const res: ApiResponse<LoginResponse> = await AuthService.login(payload);
      const payloadData = res.data;

      if (!payloadData?.accessToken) {
        clearTokens();
        return { ok: false, data: null, role: null };
      }

      setSession(payloadData.accessToken, payloadData.refreshToken, remember);

      const profileRes: ApiResponse<UserProfile> = await UserService.getProfile();
      const profile = profileRes.data;

      const rawRole = (profile as any)?.role ?? payloadData.role;

      const role = mapRole(rawRole);

      if (!role || !isAllowedAppRole(role)) {
        clearTokens();
        return { ok: false, data: payloadData, role: null };
      }

      broadcast("login");
      return { ok: true, data: payloadData, role };
    } catch {
      clearTokens();
      return { ok: false, data: null, role: null };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, clearTokens };
}
