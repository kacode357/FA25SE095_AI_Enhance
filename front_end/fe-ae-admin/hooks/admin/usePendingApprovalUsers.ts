// hooks/admin/usePendingApprovalUsers.ts
"use client";

import { useCallback, useState } from "react";
import { AdminService } from "@/services/admin.services";
import type { PendingApprovalParams } from "@/types/admin/admin.payload";
import type { PendingApprovalResponse } from "@/types/admin/admin.response";

export function usePendingApprovalUsers() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PendingApprovalResponse | null>(null);

  const fetchPendingUsers = useCallback(
    async (params?: PendingApprovalParams): Promise<PendingApprovalResponse> => {
      setLoading(true);
      try {
        const res = await AdminService.getPendingApprovalUsers(params);
        setData(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, fetchPendingUsers };
}
