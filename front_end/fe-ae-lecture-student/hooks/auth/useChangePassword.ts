// hooks/auth/useChangePassword.ts
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/auth.services";
import type { ChangePasswordPayload, ChangePasswordRequest } from "@/types/auth/auth.payload";
import type { ChangePasswordResponse } from "@/types/auth/auth.response";
import { useState } from "react";
import { toast } from "sonner";

type WithEitherId = { id?: string; userId?: string };

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getUserId = (u: unknown): string | null => {
    const maybe = u as WithEitherId | null | undefined;
    return maybe?.userId ?? maybe?.id ?? null;
  };

  const changePassword = async (
    payload: ChangePasswordPayload
  ): Promise<ChangePasswordResponse | null> => {
    const uid = getUserId(user);
    if (!uid) {
      toast.error("Missing user id.");
      return null;
    }

    setLoading(true);
    try {
      const req: ChangePasswordRequest = {
        userId: uid,
        ...payload,
      };
      const res = await AuthService.changePassword(req);

      if (!res) return null;

      // Determine success/message for both shapes:
      let success = false;
      let message = "";

      if ("success" in (res as any)) {
        success = Boolean((res as any).success);
        message = String((res as any).message ?? "");
      } else if ("status" in (res as any)) {
        const statusNum = Number((res as any).status ?? 0);
        success = statusNum >= 200 && statusNum < 300;
        message = String((res as any).message ?? "");
      }

      if (success) {
        toast.success(message || "Password updated successfully.");
      } else {
        toast.error(message || "Failed to update password.");
      }

      return res ?? null;
    } catch {
      // interceptor lo lỗi chung
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}
