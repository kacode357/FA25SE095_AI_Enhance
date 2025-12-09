// hooks/subscription/useToggleSubscriptionPlan.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SubscriptionService } from "@/services/subscription.services";
import type { SubscriptionCommandResponse } from "@/types/subscription/subscription.response";

export function useToggleSubscriptionPlan() {
  const [loading, setLoading] = useState(false);

  const toggleSubscriptionPlan = useCallback(
    async (id: string): Promise<SubscriptionCommandResponse> => {
      setLoading(true);
      try {
        const res = await SubscriptionService.toggleSubscriptionPlan(id);

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
    toggleSubscriptionPlan,
  };
}
