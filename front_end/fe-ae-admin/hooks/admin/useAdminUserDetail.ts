// hooks/admin/useAdminUserDetail.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type {
  AdminUserDetail,
  GetAdminUserByIdResponse,
} from "@/types/admin/admin-user.response";

export function useAdminUserDetail() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AdminUserDetail | null>(null);

  const fetchAdminUserDetail = useCallback(
    async (userId: string): Promise<GetAdminUserByIdResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.getAdminUserById(userId);
        setUser(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    user,
    fetchAdminUserDetail,
  };
}
