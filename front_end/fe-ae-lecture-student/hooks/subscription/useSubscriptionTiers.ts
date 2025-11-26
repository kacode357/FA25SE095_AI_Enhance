"use client";

import { useState } from "react";
import { SubscriptionService } from "@/services/subscription.services";
import type { GetSubscriptionTiersResponse } from "@/types/subscription/subscription.response";

export function useSubscriptionTiers() {
  const [loading, setLoading] = useState(false);

  const getSubscriptionTiers =
    async (): Promise<GetSubscriptionTiersResponse | null> => {
      if (loading) return null;
      setLoading(true);
      try {
        const res = await SubscriptionService.getSubscriptionTiers();
        return res;
      } finally {
        setLoading(false);
      }
    };

  return { getSubscriptionTiers, loading };
}
