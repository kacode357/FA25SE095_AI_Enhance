"use client";

import { useState } from "react";
import { toast } from "sonner"; // Nhớ import cái này để hiện thông báo

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

      // 3. Lấy profile để check role
      const profileRes = await UserService.getProfile();
      const profile: UserProfile = profileRes.data;

      // Logic kiểm tra quyền Staff
      const STAFF_ROLE_NAME = UserServiceRole[ROLE_STAFF]; // "Staff" (hoặc tên role bên BE trả về)
      const isStaff = profile.role === STAFF_ROLE_NAME;

      // ❌ Sai role -> Cút
      if (!isStaff) {
        // Xóa token vừa lưu tạm đi
        saveTokensFromLogin("", "", false);
        
        // Báo lỗi cho user biết
        toast.error("You don't have permission to access the Staff system.");
        
        return { ok: false, data: null, role: profile.role } as const;
      }

      // ✅ Đúng role -> Lưu user & Điều hướng
      await saveEncodedUser(profile, rememberMe);

      const target = "/staff/courses"; // Trang chủ của Staff

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