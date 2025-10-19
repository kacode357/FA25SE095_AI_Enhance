// hooks/auth/useChangePassword.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import type { ChangePasswordPayload, ChangePasswordRequest } from "@/types/auth/auth.payload";
import type { ChangePasswordResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
      if (res?.success) {
        toast.success(res.message || "Password updated successfully.");
      } else {
        toast.error(res?.message || "Failed to update password.");
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
