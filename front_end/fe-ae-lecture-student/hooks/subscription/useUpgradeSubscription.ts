"use client";

import { useState } from "react";
import { SubscriptionService } from "@/services/subscription.services";
import type {
  UpgradeSubscriptionPayload,
} from "@/types/subscription/subscription.payload";
import type {
  UpgradeSubscriptionResponse,
} from "@/types/subscription/subscription.response";

export function useUpgradeSubscription() {
  const [loading, setLoading] = useState(false);

  const upgradeSubscription = async (
    payload: UpgradeSubscriptionPayload
  ): Promise<UpgradeSubscriptionResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SubscriptionService.upgradeSubscription(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { upgradeSubscription, loading };
}
