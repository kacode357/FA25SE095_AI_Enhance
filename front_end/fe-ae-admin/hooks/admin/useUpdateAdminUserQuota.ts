// hooks/admin/useUpdateAdminUserQuota.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type {
  UpdateAdminUserQuotaPayload,
} from "@/types/admin/admin-user.payload";
import type {
  UpdateAdminUserQuotaResponse,
} from "@/types/admin/admin-user.response";

export function useUpdateAdminUserQuota() {
  const [loading, setLoading] = useState(false);

  const updateAdminUserQuota = useCallback(
    async (
      userId: string,
      payload: UpdateAdminUserQuotaPayload
    ): Promise<UpdateAdminUserQuotaResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.updateAdminUserQuota(userId, payload);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    updateAdminUserQuota,
  };
}
