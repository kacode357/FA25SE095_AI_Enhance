// hooks/subscription/useSubscriptionTiers.ts
"use client";

import { useCallback, useState } from "react";

import { SubscriptionTierService } from "@/services/subscription-tier.services";
import type { SubscriptionTierQuery } from "@/types/subscription/subscription-tier.payload";
import type {
  GetSubscriptionTiersResponse,
  SubscriptionTierItem,
} from "@/types/subscription/subscription-tier.response";

export function useSubscriptionTiers() {
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState<SubscriptionTierItem[]>([]);

  const fetchSubscriptionTiers = useCallback(
    async (
      params?: SubscriptionTierQuery
    ): Promise<GetSubscriptionTiersResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionTierService.getSubscriptionTiers(params);
        setTiers(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    tiers,
    fetchSubscriptionTiers,
  };
}
