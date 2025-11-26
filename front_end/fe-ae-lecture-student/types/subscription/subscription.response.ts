// types/subscription/subscription.response.ts

export type BaseSubscriptionApiResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

// GET /api/Subscription
export type GetSubscriptionResponse = BaseSubscriptionApiResponse<string>;

// POST /api/Subscription/upgrade
export type UpgradeSubscriptionResponse = BaseSubscriptionApiResponse<string>;

// POST /api/Subscription/cancel
export type CancelSubscriptionResponse = BaseSubscriptionApiResponse<string>;

// GET /api/Subscription/tiers
export type SubscriptionTier = {
  tier: string;
  description: string;
  quotaLimit: number;
  price: number;
  currency: string;
  duration: string;
  features: string[];
};

export type GetSubscriptionTiersResponse = SubscriptionTier[];
