// hooks/useUpdateProfile.ts
"use client";

import { useState, useCallback } from "react";
import { UserService } from "@/services/user.services";
import type { UpdateProfilePayload } from "@/types/user/user.payload";
import type { UpdateProfileResponse } from "@/types/user/user.response";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse | null> => {
      setLoading(true);
      try {
        const res = await UserService.updateProfile(payload);

        if (res?.success) {
          toast.success(res.message ?? "Cập nhật thành công");
          // Re-fetch từ BE để tránh sửa tay state
          await refreshProfile();

          // Đồng bộ đa tab
          if (typeof window !== "undefined") {
            localStorage.setItem("auth:broadcast", Date.now().toString());
          }
        } else {
          toast.error(res?.message || "Cập nhật thất bại");
        }

        return res ?? null;
      } catch {
        toast.error("Cập nhật thất bại");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile]
  );

  return { updateProfile, loading };
}
