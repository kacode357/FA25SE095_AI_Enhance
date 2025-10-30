// hooks/auth/useLogin.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import type { LoginPayload } from "@/types/auth/auth.payload";
import type { LoginResponse, ApiResponse } from "@/types/auth/auth.response";
import type { UserProfile } from "@/types/user/user.response";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { mapRole, ALLOWED_LOGIN_ROLES } from "@/config/user-role";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (
    payload: LoginPayload,
    rememberMe: boolean
  ): Promise<LoginResponse | null> => {
    setLoading(true);
    try {
      // 1) Gọi login: có thể trả LoginResponse hoặc ApiResponse<LoginResponse>
      const raw = (await AuthService.login(payload)) as LoginResponse | ApiResponse<LoginResponse>;
      const res: LoginResponse = ("data" in raw ? raw.data : raw);

      // 2) Lưu token vào storage (KHÔNG cookie)
      if (res?.accessToken) {
        if (rememberMe) {
          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);
          sessionStorage.removeItem("accessToken");
        } else {
          sessionStorage.setItem("accessToken", res.accessToken);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } else {
        toast.error("Login response is missing accessToken.");
        return null;
      }

      // 3) Lấy profile thật (BE của mày đang bọc ApiResponse<UserProfile>)
      const profileResp = await UserService.getProfile();
      const profile: UserProfile = profileResp.data;

      const roleEnum = mapRole(profile.role as string);
      if (!roleEnum || !ALLOWED_LOGIN_ROLES.includes(roleEnum)) {
        // Không phải role cho phép → clear token & dừng
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("accessToken");
        toast.error("Only staff members are allowed to log in!");
        return null;
      }

      // 4) Hợp lệ → vào trang staff
      router.replace("/staff/manager/terms");
      return res;
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
