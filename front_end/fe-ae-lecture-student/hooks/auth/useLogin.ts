// hooks/useLogin.ts
"use client";

import { ALLOWED_LOGIN_ROLES, mapRole, UserRole } from "@/config/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import { LoginPayload } from "@/types/auth/auth.payload";
import { LoginResponse } from "@/types/auth/auth.response";
import { UserProfile } from "@/types/user/user.response";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

      if (roleEnum === null || roleEnum === undefined || !ALLOWED_LOGIN_ROLES.includes(roleEnum)) {
        // Không đúng role được phép → xoá token + báo lỗi
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        sessionStorage.removeItem("accessToken");
        toast.error("Tài khoản không có quyền đăng nhập vào khu vực này.");
        return null;
      }

      // 3) Điều hướng theo role
      if (roleEnum === UserRole.Student) {
        router.push("/student/dashboard");
      } else {
        // Mặc định (ví dụ Lecturer)
        router.push("/manager/course");
      }
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
