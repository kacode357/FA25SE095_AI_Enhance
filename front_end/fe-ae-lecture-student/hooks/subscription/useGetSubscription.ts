"use client";

import { useState } from "react";
import { SubscriptionService } from "@/services/subscription.services";
import type { GetSubscriptionResponse } from "@/types/subscription/subscription.response";

export function useGetSubscription() {
  const [loading, setLoading] = useState(false);

  const getSubscription = async (): Promise<GetSubscriptionResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SubscriptionService.getCurrentSubscription();
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getSubscription, loading };
}
