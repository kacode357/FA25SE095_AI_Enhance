// hooks/auth/useGoogleLogin.ts
"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { ApiResponse, LoginResponse, } from "@/types/auth/auth.response";
import type { GoogleLoginPayload } from "@/types/auth/auth.payload";
import type { UserProfile } from "@/types/user/user.response";
import { UserServiceRole, ROLE_STUDENT, ROLE_LECTURER } from "@/config/user-service/user-role";
import { saveEncodedUser } from "@/utils/secure-user";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const COOKIE_OPTS = { secure: true, sameSite: "strict" as const, path: "/" as const, expires: 7 };

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);

  const googleLogin = async (payload: GoogleLoginPayload) => {
    setLoading(true);
    try {
      const res: ApiResponse<LoginResponse> = await AuthService.googleLogin(payload);
      const data = res.data;

      if (data && data.accessToken) {
        const rememberMe = payload.rememberMe ?? false;

        // Lưu token theo remember
        if (rememberMe) {
          Cookies.set(ACCESS_TOKEN_KEY, data.accessToken, COOKIE_OPTS);
          if (data.refreshToken) Cookies.set(REFRESH_TOKEN_KEY, data.refreshToken, COOKIE_OPTS);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(ACCESS_TOKEN_KEY);
            sessionStorage.removeItem(REFRESH_TOKEN_KEY);
          }
        } else {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
            if (data.refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          }
          Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
          Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
        }

        // Lấy profile -> mã hoá & lưu
        const profileRes: ApiResponse<UserProfile> = await UserService.getProfile();
        const profile = profileRes.data;
        await saveEncodedUser(profile, rememberMe);

        // Điều hướng theo role string ("Student" / "Lecturer")
        const isStudent  = profile.role === UserServiceRole[ROLE_STUDENT];
        const isLecturer = profile.role === UserServiceRole[ROLE_LECTURER];

        let target = "/";
        if (isStudent) target = "/student/all-courses";
        else if (isLecturer) target = "/lecturer/manager/course";

        if (typeof window !== "undefined") window.location.href = target;

        return { ok: true, data, role: profile.role } as const;
      }

      return { ok: false, data, role: null } as const;
    } catch (err) {
      console.error("[auth] google login error:", err);
      return { ok: false, data: null, role: null } as const;
    } finally {
      setLoading(false);
    }
  };

  return { googleLogin, loading };
}
