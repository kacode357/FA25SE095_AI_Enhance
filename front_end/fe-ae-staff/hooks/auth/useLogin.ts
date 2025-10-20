// hooks/auth/useLogin.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import { LoginPayload } from "@/types/auth/auth.payload";
import { LoginResponse } from "@/types/auth/auth.response";
import { UserProfile } from "@/types/user/user.response";
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
      // 1) Gọi login nhận token
      const res = await AuthService.login(payload);

      // 2) Lưu token vào storage (KHÔNG cookie)
      if (res.accessToken) {
        if (rememberMe) {
          // nhớ lâu (tuỳ mày: localStorage)
          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);
          sessionStorage.removeItem("accessToken");
        } else {
          // session only
          sessionStorage.setItem("accessToken", res.accessToken);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }

      // 3) Lấy profile để check role
      const profile: UserProfile = await UserService.getProfile();
      const roleEnum = mapRole(profile.role);

      if (!roleEnum || !ALLOWED_LOGIN_ROLES.includes(roleEnum)) {
        // Không phải staff
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("accessToken");
        toast.error("Only staff members are allowed to log in!");
        router.replace("/login");
        return null;
      }

      // 4) Staff → vào trang staff
      router.replace("/staff/manager/terms");
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
