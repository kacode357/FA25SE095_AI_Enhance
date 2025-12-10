// hooks/admin-dashboard/useAdminDashboardOverview.ts
"use client";

import { useCallback, useState } from "react";

import { AdminDashboardService } from "@/services/admin-dashboard.services";
import type { DashboardOverviewQuery } from "@/types/admin-dashboard/admin-dashboard.payload";
import type {
  DashboardOverviewData,
  GetDashboardOverviewResponse,
} from "@/types/admin-dashboard/admin-dashboard.response";

export function useAdminDashboardOverview() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);

  const fetchAdminDashboardOverview = useCallback(
    async (
      params?: DashboardOverviewQuery
    ): Promise<GetDashboardOverviewResponse> => {
      setLoading(true);
      try {
        const res = await AdminDashboardService.getOverview(params);
        setOverview(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    overview,
    fetchAdminDashboardOverview,
  };
}
