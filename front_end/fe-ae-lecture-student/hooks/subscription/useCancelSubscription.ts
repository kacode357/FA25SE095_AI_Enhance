"use client";

import { useState } from "react";
import { SubscriptionService } from "@/services/subscription.services";
import type {
  CancelSubscriptionPayload,
} from "@/types/subscription/subscription.payload";
import type {
  CancelSubscriptionResponse,
} from "@/types/subscription/subscription.response";

export function useCancelSubscription() {
  const [loading, setLoading] = useState(false);

  const cancelSubscription = async (
    payload: CancelSubscriptionPayload
  ): Promise<CancelSubscriptionResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SubscriptionService.cancelSubscription(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { cancelSubscription, loading };
}
