// hooks/useLogin.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import { LoginPayload } from "@/types/auth/auth.payload";
import { LoginResponse } from "@/types/auth/auth.response";
import { UserProfile } from "@/types/user/user.response";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
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
      // 1) Gọi login để lấy token
      const res = await AuthService.login(payload);

      if (res.accessToken) {
        if (rememberMe) {
          // Lưu cookie (persist) + refreshToken để interceptor có thể refresh
          Cookies.set("accessToken", res.accessToken, { secure: true, sameSite: "strict" });
          Cookies.set("refreshToken", res.refreshToken, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
        } else {
          // Session only: chỉ lưu accessToken trong sessionStorage
          sessionStorage.setItem("accessToken", res.accessToken);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
        }
      }

      // 2) Lấy profile để kiểm tra role
      const profile: UserProfile = await UserService.getProfile();
      const roleEnum = mapRole(profile.role);

      if (!roleEnum || !ALLOWED_LOGIN_ROLES.includes(roleEnum)) {
        // Không đúng role được phép → xoá token + báo lỗi
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        sessionStorage.removeItem("accessToken");
        toast.error("Chỉ giảng viên (Lecturer) mới được phép đăng nhập!");
        return null;
      }

      // 3) Thành công
      toast.success("Đăng nhập thành công!");
      router.push("/manager/class");
      return res;
    } catch {
      // Lỗi đã có interceptor/toast chung lo phần lớn trường hợp
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
