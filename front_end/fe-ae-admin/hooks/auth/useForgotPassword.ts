// hooks/auth/useForgotPassword.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import type { ForgotPasswordPayload } from "@/types/auth/auth.payload";
import type { ForgotPasswordResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (
    payload: ForgotPasswordPayload
  ): Promise<ForgotPasswordResponse> => {
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(payload);
      if (res.success && res.message) toast.success(res.message);
      // không toast lỗi ở đây
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
}
