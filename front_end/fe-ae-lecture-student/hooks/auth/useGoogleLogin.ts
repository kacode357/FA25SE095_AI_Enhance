// hooks/auth/useGoogleLogin.ts
"use client";

import { ROLE_LECTURER, ROLE_STUDENT, UserServiceRole } from "@/config/user-service/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { GoogleLoginPayload } from "@/types/auth/auth.payload";
import type { ApiResponse, LoginResponse, } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import { saveTokensFromLogin } from "@/utils/auth/access-token";
import { saveEncodedUser } from "@/utils/secure-user";
import { useState } from "react";

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);

  const googleLogin = async (payload: GoogleLoginPayload) => {
    setLoading(true);
    try {
      const res: ApiResponse<LoginResponse> = await AuthService.googleLogin(payload);
      const data = res.data;

      if (data && data.accessToken) {
        const rememberMe = payload.rememberMe ?? false;

        // Lưu token theo remember (cookie only, short expiry khi không rememberMe)
        saveTokensFromLogin(data.accessToken, data.refreshToken, rememberMe);

        // Lấy profile -> mã hoá & lưu
        const profileRes: ApiResponse<UserProfile> = await UserService.getProfile();
        const profile = profileRes.data;
        await saveEncodedUser(profile, rememberMe);

        // Điều hướng theo role string ("Student" / "Lecturer")
        const isStudent  = profile.role === UserServiceRole[ROLE_STUDENT];
        const isLecturer = profile.role === UserServiceRole[ROLE_LECTURER];

        let target = "/";
        if (isStudent) target = "/student/home";
        else if (isLecturer) target = "/lecturer/course";

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
