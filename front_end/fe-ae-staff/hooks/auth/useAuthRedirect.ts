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
        router.replace("/staff/manager/terms");
      })
      .catch(() => {
   
      });
  }, [router]);
}
