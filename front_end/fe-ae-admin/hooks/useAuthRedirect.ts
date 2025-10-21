"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { UserService } from "@/services/user.services";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) return;

    UserService.getProfile()
      .then(() => {
        router.replace("/admin/manager/class");
      })
      .catch(() => {
        // Nếu token hỏng hoặc refresh fail, interceptor sẽ tự clear
      });
  }, [router]);
}
