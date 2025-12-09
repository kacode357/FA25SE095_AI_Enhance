// hooks/payments/useCreateSubscriptionPayment.ts
"use client";

import { useState } from "react";
import { PaymentsService } from "@/services/payments.services";
import type {
  CreateSubscriptionPaymentPayload,
} from "@/types/payments/payments.payload";
import type {
  CreateSubscriptionPaymentResponse,
} from "@/types/payments/payments.response";

export function useCreateSubscriptionPayment() {
  const [loading, setLoading] = useState(false);

  const createSubscriptionPayment = async (
    payload: CreateSubscriptionPaymentPayload
  ): Promise<CreateSubscriptionPaymentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await PaymentsService.createSubscriptionPayment(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { createSubscriptionPayment, loading };
}
