// hooks/auth/useResetPassword.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import type { ResetPasswordPayload } from "@/types/auth/auth.payload";
import type { ResetPasswordResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);

  const resetPassword = async (
    payload: ResetPasswordPayload
  ): Promise<ResetPasswordResponse> => {
    setLoading(true);
    try {
      const res = await AuthService.resetPassword(payload);
      if (res.success && res.message) toast.success(res.message);
      // không toast lỗi ở đây
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading };
}
