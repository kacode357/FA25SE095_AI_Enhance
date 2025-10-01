"use client";

import { ALLOWED_LOGIN_ROLES, mapRole } from "@/config/user-role";
import { AuthService } from "@/services/auth.services";
import { UserService } from "@/services/user.services";
import { LoginPayload } from "@/types/auth/auth.payload";
import { LoginResponse } from "@/types/auth/auth.response";
import { UserProfile } from "@/types/user/user.response";
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
      // -----------------------------
      // 🔐 Case 1: Hardcoded Admin
      // -----------------------------
      if (
        payload.email === "admin@gmail.com" &&
        payload.password === "123123"
      ) {
        const fakeRes: LoginResponse = {
          userId: "1",
          email: payload.email,
          firstName: "IDCLMS",
          lastName: "Admin",
          role: "Admin",
          subscriptionTier: "Free",
          accessToken: "fake-access-token",
          refreshToken: "fake-refresh-token",
          tokenExpires: new Date(Date.now() + 3600 * 1000).toISOString(),
          expiresIn: 3600,
          crawlQuotaUsed: 0,
          crawlQuotaLimit: 1000,
          quotaResetDate: new Date(
            Date.now() + 24 * 3600 * 1000
          ).toISOString(),
          requiresEmailConfirmation: false,
          requiresApproval: false,
        };

        // Lưu token vào localStorage
        localStorage.setItem("accessToken", fakeRes.accessToken);
        localStorage.setItem("refreshToken", fakeRes.refreshToken);
        localStorage.setItem("tokenExpires", fakeRes.tokenExpires);

        // Fake profile trả về đúng type UserProfile
        const fakeProfile: UserProfile = {
          id: "1",
          email: payload.email,
          firstName: "IDCLMS",
          lastName: "Admin",
          role: "Admin",
          status: "ACTIVE",
          subscriptionTier: "Free",
          isEmailConfirmed: true,
          emailConfirmedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          crawlQuotaUsed: 0,
          crawlQuotaLimit: 1000,
          quotaResetDate: new Date(
            Date.now() + 24 * 3600 * 1000
          ).toISOString(),
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: new Date(
            Date.now() + 30 * 24 * 3600 * 1000
          ).toISOString(),
          institutionName: "IDC LMS",
          institutionAddress: "Hanoi, Vietnam",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const roleEnum = mapRole(fakeProfile.role);
        if (!roleEnum || !ALLOWED_LOGIN_ROLES.includes(roleEnum)) {
          localStorage.clear();
          toast.error("Chỉ admin (Admin) mới được phép đăng nhập!");
          return null;
        }

        toast.success("Đăng nhập thành công (hardcoded)!");
        router.push("/manager/dashboard");
        return fakeRes;
      }

      // -----------------------------
      // 🔄 Case 2: Call API thật
      // -----------------------------
      const res = await AuthService.login(payload);

      if (res.accessToken) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("tokenExpires", res.tokenExpires);
      }

      const profile: UserProfile = await UserService.getProfile();
      const roleEnum = mapRole(profile.role);

      if (!roleEnum || !ALLOWED_LOGIN_ROLES.includes(roleEnum)) {
        localStorage.clear();
        toast.error("Chỉ admin (Admin) mới được phép đăng nhập!");
        return null;
      }

      toast.success("Đăng nhập thành công!");
      router.push("/manager/dashboard");
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
