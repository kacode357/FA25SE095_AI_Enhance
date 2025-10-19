// hooks/auth/useLogin.ts
"use client";

import {
  mapRole,
  UserRole,
  ROLE_HOME,
  isAllowedAppRole,   
} from "@/config/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import { LoginPayload } from "@/types/auth/auth.payload";
import { LoginResponse } from "@/types/auth/auth.response";
import { UserProfile } from "@/types/user/user.response";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginOptions = {
  remember?: boolean;
  next?: string;
};

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const clearTokens = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    sessionStorage.removeItem("accessToken");
  };

  const setSession = (accessToken: string, refreshToken?: string, remember?: boolean) => {
    if (remember) {
      Cookies.set("accessToken", accessToken, { secure: true, sameSite: "strict", path: "/" });
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, {
          expires: 7, secure: true, sameSite: "strict", path: "/",
        });
      }
    } else {
      sessionStorage.setItem("accessToken", accessToken);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    }
  };

  const resolveNext = (role: UserRole, next?: string) => {
    const authPages = new Set([
      "/login", "/register", "/verify-email", "/forgot-password", "/reset-password",
    ]);
    if (!next) return ROLE_HOME[role];
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
      const url = new URL(next, base);
      const path = url.pathname + (url.search || "");
      if (authPages.has(url.pathname)) return ROLE_HOME[role];
      return path;
    } catch {
      return ROLE_HOME[role];
    }
  };

  const login = async (
    payload: LoginPayload,
    options: LoginOptions = {}
  ): Promise<LoginResponse | null> => {
    const { remember = false, next } = options;
    setLoading(true);

    try {
      const res = await AuthService.login(payload);
      if (!res?.accessToken) return null;

      setSession(res.accessToken, res.refreshToken, remember);

      const profile: UserProfile = await UserService.getProfile();
      const role = mapRole(profile.role);

      // ✅ dùng isAllowedAppRole thay cho ALLOWED_LOGIN_ROLES.includes
      if (role == null || !isAllowedAppRole(role)) {
        clearTokens();
        return null;
      }

      router.push(resolveNext(role, next));
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
