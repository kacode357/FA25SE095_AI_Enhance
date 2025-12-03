// hooks/useForgotPassword.ts
"use client";

import { AuthService } from "@/services/auth.services";
import { ForgotPasswordPayload } from "@/types/auth/auth.payload";
import { ForgotPasswordResponse } from "@/types/auth/auth.response";
import { useState } from "react";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (
    payload: ForgotPasswordPayload
  ): Promise<ForgotPasswordResponse> => {
    setLoading(true);
    try {
      // Gọi service, trả về kết quả thô
      return await AuthService.forgotPassword(payload);
    } finally {
      // Dù thành công hay lỗi (throw error) thì vẫn tắt loading
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
}