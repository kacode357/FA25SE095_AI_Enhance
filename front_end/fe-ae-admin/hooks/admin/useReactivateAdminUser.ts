// hooks/admin/useReactivateAdminUser.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type {
  ReactivateAdminUserResponse,
} from "@/types/admin/admin-user.response";
import { toast } from "sonner";

export function useReactivateAdminUser() {
  const [loading, setLoading] = useState(false);

  const reactivateAdminUser = useCallback(
    async (userId: string): Promise<ReactivateAdminUserResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.reactivateAdminUser(userId);
        toast.success(res.message || "User reactivated successfully");
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    reactivateAdminUser,
  };
}
