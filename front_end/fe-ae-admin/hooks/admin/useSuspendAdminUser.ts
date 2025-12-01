// hooks/admin/useSuspendAdminUser.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type {
  SuspendAdminUserPayload,
} from "@/types/admin/admin-user.payload";
import type {
  SuspendAdminUserResponse,
} from "@/types/admin/admin-user.response";
import { toast } from "sonner";

export function useSuspendAdminUser() {
  const [loading, setLoading] = useState(false);

  const suspendAdminUser = useCallback(
    async (
      userId: string,
      payload: SuspendAdminUserPayload
    ): Promise<SuspendAdminUserResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.suspendAdminUser(userId, payload);
        toast.success(res.message || "User suspended successfully");
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    suspendAdminUser,
  };
}
