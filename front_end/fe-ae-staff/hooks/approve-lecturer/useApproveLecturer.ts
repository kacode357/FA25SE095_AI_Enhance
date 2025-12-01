// hooks/admin/useApproveAdminUser.ts
"use client";

import { AdminService } from "@/services/approve-lecturer.services";
import { ApproveUserResponse } from "@/types/approve-lecturer/approve-lecturer.response";
import { useCallback, useState } from "react";

import { toast } from "sonner";

export function useApproveAdminUser() {
  const [loading, setLoading] = useState(false);

  const approveAdminUser = useCallback(
    async (userId: string): Promise<ApproveUserResponse> => {
      setLoading(true);
      try {
        const res = await AdminService.approveUser(userId);
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
