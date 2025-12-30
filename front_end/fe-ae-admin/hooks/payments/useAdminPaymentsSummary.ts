// hooks/payments/useAdminPaymentsSummary.ts
"use client";

import { useCallback, useState } from "react";

import { PaymentService } from "@/services/payment.services";
import type {
  AdminPaymentsStatistics,
  GetAdminPaymentsStatisticsResponse,
} from "@/types/payments/payment.response";
import type { AdminPaymentsStatisticsQuery } from "@/types/payments/payment.payload";

export function useAdminPaymentsSummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AdminPaymentsStatistics | null>(null);

  const fetchAdminPaymentsSummary = useCallback(
    async (
      params?: AdminPaymentsStatisticsQuery
    ): Promise<GetAdminPaymentsStatisticsResponse> => {
      setLoading(true);
      try {
        const res = await PaymentService.getAdminPaymentsStatistics(params);

        setSummary(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    summary,
    fetchAdminPaymentsSummary,
  };
}
