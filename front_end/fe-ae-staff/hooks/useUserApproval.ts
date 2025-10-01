"use client";

import { useState, useCallback } from "react";
import { AdminService } from "@/services/admin.services";
import {
  ApproveUserResponse,
  SuspendUserResponse,
} from "@/types/admin/admin.response";
import { SuspendUserPayload } from "@/types/admin/admin.payload";

export function useUserApproval() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    ApproveUserResponse | SuspendUserResponse | null
  >(null);

  const approveUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await AdminService.approveUser(userId);
      setResult(res);
      return res;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to approve user";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const suspendUser = useCallback(
    async (userId: string, payload: SuspendUserPayload) => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminService.suspendUser(userId, payload);
        setResult(res);
        return res;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to suspend user";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { approveUser, suspendUser, loading, error, result };
}
