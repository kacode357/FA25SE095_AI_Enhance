// hooks/user/useUpdateProfile.ts
"use client";

import { useState, useCallback } from "react";
import { UserService } from "@/services/user.services";
import type { UpdateProfilePayload } from "@/types/user/user.payload";
import type { UpdateProfileResponse, UserProfile } from "@/types/user/user.response";
import type { ApiResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse | null> => {
      setLoading(true);
      try {
        // resp: { status, message, data }
        const resp: ApiResponse<UpdateProfileResponse> = await UserService.updateProfile(payload);
        const { status, message, data } = resp;

        const isOk = status >= 200 && status < 300;
        if (isOk) {
          // Ưu tiên message từ server nếu có
          toast.success(message );

          // Nếu BE trả updatedProfile thì cập nhật vào AuthContext
          const updated: UserProfile | undefined = data?.updatedProfile as UserProfile | undefined;
          if (updated) {
            setUser(updated);
          }

          // Trả về payload đã unwrap cho caller
          return data ?? null;
        } else {
          toast.error(message || "Cập nhật thất bại");
          return null;
        }
      } catch (e) {
        toast.error("Cập nhật thất bại");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  return { updateProfile, loading };
}
