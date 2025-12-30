// hooks/subscription/useDeleteSubscriptionTier.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SubscriptionTierService } from "@/services/subscription-tier.services";
import type { SubscriptionTierCommandResponse } from "@/types/subscription/subscription-tier.response";

export function useDeleteSubscriptionTier() {
  const [loading, setLoading] = useState(false);

  const deleteSubscriptionTier = useCallback(
    async (id: string): Promise<SubscriptionTierCommandResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionTierService.deleteSubscriptionTier(id);
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
    deleteSubscriptionTier,
  };
}
