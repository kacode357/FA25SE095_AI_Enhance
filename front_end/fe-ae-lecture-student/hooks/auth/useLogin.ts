// hooks/auth/useLogin.ts
"use client";

import {
  mapRole,
  UserRole,
  isAllowedAppRole,
} from "@/config/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import { LoginPayload } from "@/types/auth/auth.payload";
import { LoginResponse } from "@/types/auth/auth.response";
import { UserProfile } from "@/types/user/user.response";
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

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const clearTokens = () => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("accessToken");
    }
  };

  const setSession = (
    accessToken: string,
    refreshToken?: string,
    remember?: boolean
  ) => {
    if (remember) {
      Cookies.set("accessToken", accessToken, {
        secure: true,
        sameSite: "strict",
        path: "/",
      });
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, {
          expires: 7,
          secure: true,
          sameSite: "strict",
          path: "/",
        });
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("accessToken");
      }
    } else {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("accessToken", accessToken);
      }
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
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

      setSession(res.accessToken, res.refreshToken, remember);

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

      // ✅ ONE-SHOT FLAG: báo cho RoleGate biết "vừa login xong"
      if (typeof window !== "undefined") {
        sessionStorage.setItem("just_logged_in", "1");
      }

      return { ok: true, data: res, role };
    } catch {
      clearTokens();
      return { ok: false, data: null, role: null };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
