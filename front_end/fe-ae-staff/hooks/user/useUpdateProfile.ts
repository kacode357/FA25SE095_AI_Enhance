// hooks/user/useUpdateProfile.ts
"use client";

import { useState, useCallback } from "react";
import { UserService } from "@/services/user.services";
import type { UpdateProfilePayload } from "@/types/user/user.payload";
import type { UpdateProfileResponse } from "@/types/user/user.response";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse } from "@/types/auth/auth.response";

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse | null> => {
      setLoading(true);
      try {
        const res: ApiResponse<UpdateProfileResponse> = await UserService.updateProfile(payload);
        const data = res.data;
        const success = (data as any)?.success ?? res.status === 200;
        if (success) {
          toast.success(res.message || (data as any)?.message || "Cập nhật thành công");
          await refreshProfile();
          if (typeof window !== "undefined") {
            localStorage.setItem("auth:broadcast", JSON.stringify({ at: Date.now(), reason: "profile-updated" }));
          }
          return data;
        }
        return null;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile]
  );

  return { updateProfile, loading };
}
