// hooks/subscription/useCreateSubscriptionTier.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SubscriptionTierService } from "@/services/subscription-tier.services";
import type { CreateSubscriptionTierPayload } from "@/types/subscription/subscription-tier.payload";
import type { SubscriptionTierCommandResponse } from "@/types/subscription/subscription-tier.response";

export function useCreateSubscriptionTier() {
  const [loading, setLoading] = useState(false);

  const createSubscriptionTier = useCallback(
    async (
      payload: CreateSubscriptionTierPayload
    ): Promise<SubscriptionTierCommandResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionTierService.createSubscriptionTier(
          payload
        );
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
    createSubscriptionTier,
  };
}
