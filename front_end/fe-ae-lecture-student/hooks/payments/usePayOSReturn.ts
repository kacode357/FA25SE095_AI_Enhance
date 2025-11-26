"use client";

import { useState } from "react";
import { PaymentsService } from "@/services/payments.services";
import type {
  PayOSReturnQuery,
} from "@/types/payments/payments.payload";
import type {
  PayOSReturnResponse,
} from "@/types/payments/payments.response";

export function usePayOSReturn() {
  const [loading, setLoading] = useState(false);

  const getPayOSReturn = async (
    params: PayOSReturnQuery
  ): Promise<PayOSReturnResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await PaymentsService.getPayOSReturn(params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getPayOSReturn, loading };
}
