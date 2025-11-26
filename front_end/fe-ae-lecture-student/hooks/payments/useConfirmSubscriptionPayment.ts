"use client";

import { useState } from "react";
import { PaymentsService } from "@/services/payments.services";
import type {
  ConfirmSubscriptionPaymentPayload,
} from "@/types/payments/payments.payload";
import type {
  ConfirmSubscriptionPaymentResponse,
} from "@/types/payments/payments.response";

export function useConfirmSubscriptionPayment() {
  const [loading, setLoading] = useState(false);

  const confirmSubscriptionPayment = async (
    payload: ConfirmSubscriptionPaymentPayload
  ): Promise<ConfirmSubscriptionPaymentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await PaymentsService.confirmSubscriptionPayment(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { confirmSubscriptionPayment, loading };
}
