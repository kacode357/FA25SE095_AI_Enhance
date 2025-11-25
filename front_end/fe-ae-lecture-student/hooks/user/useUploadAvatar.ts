// hooks/user/useUploadAvatar.ts
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/user.services";
import type { ApiResponse } from "@/types/auth/auth.response";
import type { UploadAvatarPayload } from "@/types/user/user.payload";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useUploadAvatar() {
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const uploadAvatar = useCallback(
    async (payload: UploadAvatarPayload): Promise<string | null> => {
      setLoading(true);
      try {
        const res: ApiResponse<string> = await UserService.uploadAvatar(payload);
        const success = res.status === 200 || res.status === 100;

        if (success) {
          toast.success(res.message || "Upload avatar thành công");

          // refresh user profile
          await refreshProfile();

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "auth:broadcast",
              JSON.stringify({ at: Date.now(), reason: "avatar-updated" })
            );
          }

          return res.data;
        }

        return null;
      } catch (error) {
        toast.error("Upload avatar thất bại");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile]
  );

  return { uploadAvatar, loading };
}
