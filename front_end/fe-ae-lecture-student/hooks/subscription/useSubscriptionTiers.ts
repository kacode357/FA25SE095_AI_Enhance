// hooks/subscription/useSubscriptionTiers.ts
"use client";

import { useState } from "react";
import { SubscriptionService } from "@/services/subscription.services";
import type {
  GetSubscriptionTiersResponse,
  SubscriptionTier,
} from "@/types/subscription/subscription.response";

export function useSubscriptionTiers() {
  const [loading, setLoading] = useState(false);

  // Luôn return SubscriptionTier[], không return response wrapper nữa
  const getSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
    if (loading) return [];

    setLoading(true);
    try {
      const res: GetSubscriptionTiersResponse =
        await SubscriptionService.getSubscriptionTiers();

      // res.data: SubscriptionTier[]
      return res.data ?? [];
    } finally {
      setLoading(false);
    }
  };

  return { getSubscriptionTiers, loading };
}
