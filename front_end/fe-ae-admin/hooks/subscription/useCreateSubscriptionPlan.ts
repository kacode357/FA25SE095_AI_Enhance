// hooks/subscription/useCreateSubscriptionPlan.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SubscriptionService } from "@/services/subscription.services";
import type { CreateSubscriptionPlanPayload } from "@/types/subscription/subscription.payload";
import type { SubscriptionCommandResponse } from "@/types/subscription/subscription.response";

export function useCreateSubscriptionPlan() {
  const [loading, setLoading] = useState(false);

  const createSubscriptionPlan = useCallback(
    async (
      payload: CreateSubscriptionPlanPayload
    ): Promise<SubscriptionCommandResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionService.createSubscriptionPlan(payload);
        if (res.status === 200 || res.status === 201) {
          toast.success(res.message);
        }

        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    createSubscriptionPlan,
  };
}
