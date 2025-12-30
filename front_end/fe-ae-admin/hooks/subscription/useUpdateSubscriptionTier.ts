// hooks/subscription/useUpdateSubscriptionTier.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SubscriptionTierService } from "@/services/subscription-tier.services";
import type { UpdateSubscriptionTierPayload } from "@/types/subscription/subscription-tier.payload";
import type { SubscriptionTierCommandResponse } from "@/types/subscription/subscription-tier.response";

export function useUpdateSubscriptionTier() {
  const [loading, setLoading] = useState(false);

  const updateSubscriptionTier = useCallback(
    async (
      id: string,
      payload: UpdateSubscriptionTierPayload
    ): Promise<SubscriptionTierCommandResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionTierService.updateSubscriptionTier(
          id,
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
    updateSubscriptionTier,
  };
}
