// hooks/admin-dashboard/useAdminDashboardRevenue.ts
"use client";

import { useCallback, useState } from "react";

import { AdminDashboardService } from "@/services/admin-dashboard.services";
import type { DashboardRevenueQuery } from "@/types/admin-dashboard/admin-dashboard.payload";
import type {
  GetDashboardRevenueResponse,
  RevenueStatistics,
} from "@/types/admin-dashboard/admin-dashboard.response";

export function useAdminDashboardRevenue() {
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState<RevenueStatistics | null>(null);

  const fetchAdminDashboardRevenue = useCallback(
    async (
      params?: DashboardRevenueQuery
    ): Promise<GetDashboardRevenueResponse> => {
      setLoading(true);
      try {
        const res = await AdminDashboardService.getRevenue(params);
        setRevenue(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    revenue,
    fetchAdminDashboardRevenue,
  };
}
