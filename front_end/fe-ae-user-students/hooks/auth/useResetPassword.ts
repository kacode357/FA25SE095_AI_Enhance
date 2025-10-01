// hooks/useResetPassword.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import { ResetPasswordPayload } from "@/types/auth/auth.payload";
import { ResetPasswordResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);

  const resetPassword = async (
    payload: ResetPasswordPayload
  ): Promise<ResetPasswordResponse | null> => {
    setLoading(true);
    try {
      const res = await AuthService.resetPassword(payload);

      if (res.success) {
        toast.success(res.message || "Password has been reset successfully!");
      } else {
        toast.error(res.message || "Unable to reset password.");
      }

      return res;
    } catch {
      // interceptor đã lo toast lỗi chung
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading };
}
