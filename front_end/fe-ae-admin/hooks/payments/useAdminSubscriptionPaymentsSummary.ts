// hooks/payments/useAdminSubscriptionPaymentsSummary.ts
"use client";

import { useCallback, useState } from "react";

import { PaymentService } from "@/services/payment.services";
import type {
  GetAdminSubscriptionPaymentsSummaryResponse,
  SubscriptionPaymentsSummary,
} from "@/types/payments/payment.response";
import type { AdminSubscriptionPaymentsQuery } from "@/types/payments/payment.payload";

export function useAdminSubscriptionPaymentsSummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SubscriptionPaymentsSummary | null>(
    null
  );

  const fetchAdminSubscriptionPaymentsSummary = useCallback(
    async (
      params?: AdminSubscriptionPaymentsQuery
    ): Promise<GetAdminSubscriptionPaymentsSummaryResponse> => {
      setLoading(true);
      try {
        const res =
          await PaymentService.getAdminSubscriptionPaymentsSummary(params);

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
    fetchAdminSubscriptionPaymentsSummary,
  };
}
