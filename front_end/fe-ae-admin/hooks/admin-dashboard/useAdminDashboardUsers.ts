// hooks/admin-dashboard/useAdminDashboardUsers.ts
"use client";

import { useCallback, useState } from "react";

import { AdminDashboardService } from "@/services/admin-dashboard.services";
import type { DashboardUsersQuery } from "@/types/admin-dashboard/admin-dashboard.payload";
import type {
  GetDashboardUsersResponse,
  UserStatistics,
} from "@/types/admin-dashboard/admin-dashboard.response";

export function useAdminDashboardUsers() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserStatistics | null>(null);

  const fetchAdminDashboardUsers = useCallback(
    async (
      params?: DashboardUsersQuery
    ): Promise<GetDashboardUsersResponse> => {
      setLoading(true);
      try {
        const res = await AdminDashboardService.getUsers(params);
        setUsers(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    users,
    fetchAdminDashboardUsers,
  };
}
