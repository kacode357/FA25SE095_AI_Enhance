// hooks/admin/useResetAdminUserQuota.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type {
  ResetAdminUserQuotaResponse,
} from "@/types/admin/admin-user.response";

export function useResetAdminUserQuota() {
  const [loading, setLoading] = useState(false);

  const resetAdminUserQuota = useCallback(
    async (userId: string): Promise<ResetAdminUserQuotaResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.resetAdminUserQuota(userId);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    resetAdminUserQuota,
  };
}
