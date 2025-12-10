// hooks/admin-dashboard/useAdminDashboardPayments.ts
"use client";

import { useCallback, useState } from "react";

import { AdminDashboardService } from "@/services/admin-dashboard.services";
import type { DashboardPaymentsQuery } from "@/types/admin-dashboard/admin-dashboard.payload";
import type {
  GetDashboardPaymentsResponse,
  PaymentStatistics,
} from "@/types/admin-dashboard/admin-dashboard.response";

export function useAdminDashboardPayments() {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentStatistics | null>(null);

  const fetchAdminDashboardPayments = useCallback(
    async (
      params?: DashboardPaymentsQuery
    ): Promise<GetDashboardPaymentsResponse> => {
      setLoading(true);
      try {
        const res = await AdminDashboardService.getPayments(params);
        setPayments(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    payments,
    fetchAdminDashboardPayments,
  };
}
