// types/subscription/subscription.payload.ts
import type { SubscriptionTier } from "@/types/subscription/subscription.response";

export interface SubscriptionPlansQuery {
  isActive?: boolean;
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  quotaLimit: number;
  features: string[];
  isActive: boolean;
  tier: SubscriptionTier;
}

export interface UpdateSubscriptionPlanPayload {
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  quotaLimit: number;
  features: string[];
  isActive: boolean;
}
