// hooks/auth/useLogin.ts
"use client";

import { ROLE_LECTURER, ROLE_STUDENT, UserServiceRole } from "@/config/user-service/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { LoginPayload } from "@/types/auth/auth.payload";
import type { ApiResponse, LoginResponse } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import { saveEncodedUser } from "@/utils/secure-user";
import { saveTokensFromLogin } from "@/utils/auth/access-token";
import { useState } from "react";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res: ApiResponse<LoginResponse> = await AuthService.login(payload);
      const data = res.data;

      if (data && data.accessToken) {
        const rememberMe = payload.rememberMe ?? false;

        // ✅ Lưu access + refresh + remember logic
        saveTokensFromLogin(data.accessToken, data.refreshToken, rememberMe);

        // Lấy profile -> MÃ HOÁ & LƯU theo remember (session/cookie)
        const profileRes = await UserService.getProfile();
        const profile: UserProfile = profileRes.data;
        await saveEncodedUser(profile, rememberMe);

        // Điều hướng theo role string
        const isStudent  = profile.role === UserServiceRole[ROLE_STUDENT];   // "Student"
        const isLecturer = profile.role === UserServiceRole[ROLE_LECTURER];  // "Lecturer"

        let target = "/";
        if (isStudent) target = "/student/all-courses";
        else if (isLecturer) target = "/lecturer/course";

        if (typeof window !== "undefined") window.location.href = target;

        return { ok: true, data, role: profile.role } as const;
      }

      return { ok: false, data, role: null } as const;
    } catch (err) {
      console.error("[auth] login error:", err);
      return { ok: false, data: null, role: null } as const;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
