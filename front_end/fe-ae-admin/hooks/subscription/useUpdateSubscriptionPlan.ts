// hooks/subscription/useUpdateSubscriptionPlan.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SubscriptionService } from "@/services/subscription.services";
import type { UpdateSubscriptionPlanPayload } from "@/types/subscription/subscription.payload";
import type { SubscriptionCommandResponse } from "@/types/subscription/subscription.response";

export function useUpdateSubscriptionPlan() {
  const [loading, setLoading] = useState(false);

  const updateSubscriptionPlan = useCallback(
    async (
      id: string,
      payload: UpdateSubscriptionPlanPayload
    ): Promise<SubscriptionCommandResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionService.updateSubscriptionPlan(
          id,
          payload
        );

        // ✅ toast thành công
        if (res?.message) {
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
    updateSubscriptionPlan,
  };
}
