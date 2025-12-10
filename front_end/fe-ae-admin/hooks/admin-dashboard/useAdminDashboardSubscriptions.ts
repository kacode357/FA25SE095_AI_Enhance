// hooks/admin-dashboard/useAdminDashboardSubscriptions.ts
"use client";

import { useCallback, useState } from "react";

import { AdminDashboardService } from "@/services/admin-dashboard.services";
import type { DashboardSubscriptionsQuery } from "@/types/admin-dashboard/admin-dashboard.payload";
import type {
  GetDashboardSubscriptionsResponse,
  SubscriptionStatistics,
} from "@/types/admin-dashboard/admin-dashboard.response";

export function useAdminDashboardSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] =
    useState<SubscriptionStatistics | null>(null);

  const fetchAdminDashboardSubscriptions = useCallback(
    async (
      params?: DashboardSubscriptionsQuery
    ): Promise<GetDashboardSubscriptionsResponse> => {
      setLoading(true);
      try {
        const res = await AdminDashboardService.getSubscriptions(params);
        setSubscriptions(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    subscriptions,
    fetchAdminDashboardSubscriptions,
  };
}
