// hooks/useForgotPassword.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import { ForgotPasswordPayload } from "@/types/auth/auth.payload";
import { ForgotPasswordResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (
    payload: ForgotPasswordPayload
  ): Promise<ForgotPasswordResponse | null> => {
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(payload);

      if (res.success) {
        toast.success(res.message || "Reset link sent to your email!");
      } else {
        toast.error(res.message || "Unable to send reset link.");
      }

      return res;
    } catch {
      // interceptor đã handle toast lỗi
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
}
