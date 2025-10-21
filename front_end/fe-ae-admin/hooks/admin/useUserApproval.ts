// hooks/admin/useUserApproval.ts
"use client";

import { useCallback, useState } from "react";
import { AdminService } from "@/services/admin.services";
import type {
  ApproveUserResponse,
  SuspendUserResponse,
} from "@/types/admin/admin.response";
import type { SuspendUserPayload } from "@/types/admin/admin.payload";

export function useUserApproval() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    ApproveUserResponse | SuspendUserResponse | null
  >(null);

  const approveUser = useCallback(
    async (userId: string): Promise<ApproveUserResponse> => {
      setLoading(true);
      try {
        const res = await AdminService.approveUser(userId);
        setResult(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const suspendUser = useCallback(
    async (
      userId: string,
      payload: SuspendUserPayload
    ): Promise<SuspendUserResponse> => {
      setLoading(true);
      try {
        const res = await AdminService.suspendUser(userId, payload);
        setResult(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { approveUser, suspendUser, loading, result };
}
