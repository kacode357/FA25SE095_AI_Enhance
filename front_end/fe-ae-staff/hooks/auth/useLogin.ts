"use client";

import { useState } from "react";
import { toast } from "sonner"; // Nhớ import cái này để báo lỗi

import { ROLE_STAFF, UserServiceRole } from "@/config/user-service/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { LoginPayload } from "@/types/auth/auth.payload";
import type { ApiResponse, LoginResponse } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import { saveTokensFromLogin } from "@/utils/auth/access-token";
import { saveEncodedUser } from "@/utils/secure-user";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      // 1. Gọi API Login lấy Token
      const res: ApiResponse<LoginResponse> = await AuthService.login(payload);
      const data = res.data;

      if (!data || !data.accessToken) {
        return { ok: false, data: null, role: null } as const;
      }

      const rememberMe = payload.rememberMe ?? false;

      // 2. Tạm lưu token để call getProfile (interceptor cần token này)
      saveTokensFromLogin(data.accessToken, data.refreshToken, rememberMe);

      // 3. Lấy Profile
      const profileRes = await UserService.getProfile();
      const profile: UserProfile = profileRes.data;

      // 4. Kiểm tra quyền Staff
      // Giả sử UserServiceRole[ROLE_STAFF] trả về chuỗi "Staff" (check lại config của mày nhé)
      const isStaff = profile.role === UserServiceRole[ROLE_STAFF];

      // ❌ Nếu không phải Staff -> Đuổi ra
      if (!isStaff) {
        // Xóa sạch token vừa lưu (overwrite bằng rỗng)
        saveTokensFromLogin("", "", false);
        
        // Báo lỗi
        toast.error("Access denied. You are not authorized as Staff.");
        
        return { ok: false, data: null, role: profile.role } as const;
      }

      // ✅ Nếu đúng là Staff -> Lưu user & Redirect
      await saveEncodedUser(profile, rememberMe);

      const target = "/staff/courses";

      if (typeof window !== "undefined") {
        window.location.href = target;
      }

      return { ok: true, data, role: profile.role } as const;
    } catch {
      // Lỗi mạng/server: interceptor lo toast, ở đây return fail
      return { ok: false, data: null, role: null } as const;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}