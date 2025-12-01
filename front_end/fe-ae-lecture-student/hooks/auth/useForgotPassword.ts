// hooks/useForgotPassword.ts
"use client";

import { AuthService } from "@/services/auth.services";
import { ForgotPasswordPayload } from "@/types/auth/auth.payload";
import { ForgotPasswordResponse } from "@/types/auth/auth.response";
import { useState } from "react";
import { toast } from "sonner";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (
    payload: ForgotPasswordPayload
  ): Promise<ForgotPasswordResponse | null> => {
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(payload);

      let success = false;
      let message = "";

      if (!res) {
        return null;
      }

      if ("success" in (res as any)) {
        success = Boolean((res as any).success);
        message = String((res as any).message ?? "");
      } else if ("status" in (res as any)) {
        const statusNum = Number((res as any).status ?? 0);
        success = statusNum >= 200 && statusNum < 300;
        message = String((res as any).message ?? "");
      }

      if ("success" in (res as any)) {
        if (success) {
          toast.success(message || "Reset link sent to your email!");
        } else {
          toast.error(message || "Unable to send reset link.");
        }
      }

      return res;
    } catch {
      // interceptor already handled error toasts
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
}
