// hooks/payments/useCancelSubscriptionPayment.ts
"use client";

import { useState } from "react";
import { PaymentsService } from "@/services/payments.services";
import type {
  CancelSubscriptionPaymentPayload,
} from "@/types/payments/payments.payload";
import type {
  CancelSubscriptionPaymentResponse,
} from "@/types/payments/payments.response";

export function useCancelSubscriptionPayment() {
  const [loading, setLoading] = useState(false);

  const cancelSubscriptionPayment = async (
    payload: CancelSubscriptionPaymentPayload
  ): Promise<CancelSubscriptionPaymentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await PaymentsService.cancelSubscriptionPayment(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { cancelSubscriptionPayment, loading };
}
