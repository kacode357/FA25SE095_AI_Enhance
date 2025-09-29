// hooks/usePendingApprovalUsers.ts
"use client";

import { useCallback, useState } from "react";
import { AdminService } from "@/services/admin.services";
import { PendingApprovalParams } from "@/types/admin/admin.payload";
import { PendingApprovalResponse } from "@/types/admin/admin.response";

export function usePendingApprovalUsers() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PendingApprovalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingUsers = useCallback(async (params?: PendingApprovalParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AdminService.getPendingApprovalUsers(params);
      setData(response);
      return response;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Failed to fetch pending users";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchPendingUsers };
}
