// hooks/subscription/useSubscriptionPlans.ts
"use client";

import { useCallback, useState } from "react";

import { SubscriptionService } from "@/services/subscription.services";
import type { SubscriptionPlansQuery } from "@/types/subscription/subscription.payload";
import type {
  GetSubscriptionPlansResponse,
  SubscriptionPlan,
} from "@/types/subscription/subscription.response";

export function useSubscriptionPlans() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const fetchSubscriptionPlans = useCallback(
    async (
      params?: SubscriptionPlansQuery
    ): Promise<GetSubscriptionPlansResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionService.getSubscriptionPlans(params);
        setPlans(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    plans,
    fetchSubscriptionPlans,
  };
}
