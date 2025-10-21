// hooks/auth/useLogin.ts
"use client";

import { mapRole, UserRole, isAllowedAppRole } from "@/config/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { LoginPayload } from "@/types/auth/auth.payload";
import type { LoginResponse } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import Cookies from "js-cookie";
import { useState } from "react";

type LoginOptions = {
  remember?: boolean; // true => 7 ngày, false => 10s (test)
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

/** Tạo Date hết hạn sau N mili-giây */
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

  /**
   * Lưu token:
   * - remember=true: 7 ngày (access + refresh)
   * - remember=false: 10 giây (access + refresh, để test)
   */
  const setSession = (accessToken: string, refreshToken?: string, remember?: boolean) => {
    if (remember) {
      Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
        ...COMMON_COOKIE_OPTS,
        expires: 7,
      });
      if (refreshToken) {
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
          ...COMMON_COOKIE_OPTS,
          expires: 7,
        });
      }
    } else {
      const shortExpire = expiresInMs(30 * 60 * 1000);
      Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
        ...COMMON_COOKIE_OPTS,
        expires: shortExpire,
      });
      if (refreshToken) {
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
          ...COMMON_COOKIE_OPTS,
          expires: shortExpire,
        });
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
      const res = await AuthService.login(payload);
      if (!res?.accessToken) {
        clearTokens();
        return { ok: false, data: null, role: null };
      }

      // Lưu token theo remember
      setSession(res.accessToken, res.refreshToken, remember);

      // Lấy profile để xác thực role
      const profile: UserProfile = await UserService.getProfile();
      const rawRole =
        (profile as any)?.role ??
        (profile as any)?.roleName ??
        (profile as any)?.role?.name;

      const role = mapRole(rawRole);

      if (!role || !isAllowedAppRole(role)) {
        clearTokens();
        return { ok: false, data: res, role: null };
      }

      // Phát broadcast hợp lệ
      broadcast("login");

      return { ok: true, data: res, role };
    } catch {
      clearTokens();
      return { ok: false, data: null, role: null };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, clearTokens };
}
