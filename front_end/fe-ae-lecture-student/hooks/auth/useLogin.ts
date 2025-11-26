// hooks/auth/useLogin.ts
"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  ROLE_LECTURER,
  ROLE_STUDENT,
  UserServiceRole,
} from "@/config/user-service/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { LoginPayload } from "@/types/auth/auth.payload";
import type { ApiResponse, LoginResponse } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import { saveEncodedUser } from "@/utils/secure-user";
import { saveTokensFromLogin } from "@/utils/auth/access-token";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res: ApiResponse<LoginResponse> = await AuthService.login(payload);
      const data = res.data;

      if (!data || !data.accessToken) {
        return { ok: false, data: null, role: null } as const;
      }

      const rememberMe = payload.rememberMe ?? false;

      // Tạm lưu token để call getProfile (interceptor dùng token từ đây)
      saveTokensFromLogin(data.accessToken, data.refreshToken, rememberMe);

      // Lấy profile
      const profileRes = await UserService.getProfile();
      const profile: UserProfile = profileRes.data;

      const isStudent = profile.role === UserServiceRole[ROLE_STUDENT]; // "Student"
      const isLecturer = profile.role === UserServiceRole[ROLE_LECTURER]; // "Lecturer"
      const isAllowed = isStudent || isLecturer;

      //  Sai role -> không cho vào hệ thống
      if (!isAllowed) {
        saveTokensFromLogin("", "", false);
        toast.error("You don't have permission to access this system.");
        return { ok: false, data: null, role: profile.role } as const;
      }

      await saveEncodedUser(profile, rememberMe);

      let target = "/";
      if (isStudent) target = "/student/all-courses";
      else if (isLecturer) target = "/lecturer/course";

      if (typeof window !== "undefined") {
        window.location.href = target;
      }

      return { ok: true, data, role: profile.role } as const;
    } catch {
      // Lỗi HTTP / network: interceptor lo toast, ở đây chỉ trả kết quả
      return { ok: false, data: null, role: null } as const;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
