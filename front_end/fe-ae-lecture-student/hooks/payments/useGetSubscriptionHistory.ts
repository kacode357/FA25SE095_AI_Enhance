"use client";

import { useState } from "react";
import { PaymentsService } from "@/services/payments.services";
import type {
  SubscriptionHistoryQuery,
} from "@/types/payments/payments.payload";
import type {
  SubscriptionHistoryResponse,
} from "@/types/payments/payments.response";

export function useGetSubscriptionHistory() {
  const [loading, setLoading] = useState(false);

  const getSubscriptionHistory = async (
    params: SubscriptionHistoryQuery
  ): Promise<SubscriptionHistoryResponse | null> => {
    // Nếu đang load thì chặn không gọi tiếp để tránh spam
    if (loading) return null;
    
    setLoading(true);
    try {
      const res = await PaymentsService.getSubscriptionHistory(params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getSubscriptionHistory, loading };
}