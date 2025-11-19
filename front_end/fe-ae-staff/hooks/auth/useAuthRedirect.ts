"use client";

import { UserService } from "@/services/user.services";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) return;

    UserService.getProfile()
      .then(() => {
        router.replace("/staff/terms");
      })
      .catch(() => {
   
      });
  }, [router]);
}
