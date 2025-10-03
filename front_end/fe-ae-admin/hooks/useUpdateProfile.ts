// hooks/useUpdateProfile.ts
"use client";

import { useState, useCallback } from "react";
import { UserService } from "@/services/user.services";
import { UpdateProfilePayload } from "@/types/user/user.payload";
import { UpdateProfileResponse } from "@/types/user/user.response";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse | null> => {
      setLoading(true);
      try {
        const res = await UserService.updateProfile(payload);
        if (res.success) {
          toast.success(res.message);
          setUser(res.updatedProfile); // cập nhật AuthContext ngay
        } else {
          toast.error(res.message || "Cập nhật thất bại");
        }
        return res;
      } catch {
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
