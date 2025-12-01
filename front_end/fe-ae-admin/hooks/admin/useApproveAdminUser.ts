// hooks/admin/useApproveAdminUser.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type { ApproveAdminUserResponse } from "@/types/admin/admin-user.response";
import { toast } from "sonner";

export function useApproveAdminUser() {
  const [loading, setLoading] = useState(false);

  const approveAdminUser = useCallback(
    async (userId: string): Promise<ApproveAdminUserResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.approveAdminUser(userId);
        toast.success(res.message || "User approved successfully");
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    approveAdminUser,
  };
}
