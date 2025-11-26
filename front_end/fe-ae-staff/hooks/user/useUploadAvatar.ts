"use client";

import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/user.services";
import type { UploadAvatarPayload } from "@/types/user/user.payload";
import type { UploadAvatarResponse } from "@/types/user/user.response";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useUploadAvatar() {
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const uploadAvatar = useCallback(
    async (payload: UploadAvatarPayload): Promise<string | null> => {
      setLoading(true);
      try {
        const res: UploadAvatarResponse = await UserService.uploadAvatar(payload);

        const success = res.status === 200;

        if (success) {
          toast.success(res.message || "Upload avatar thành công");

          await refreshProfile();

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "auth:broadcast",
              JSON.stringify({ at: Date.now(), reason: "avatar-updated" })
            );
          }

          return res.data.profilePictureUrl;
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
