// types/subscription/subscription.payload.ts

export type UpgradeSubscriptionPayload = {
  userId: string;
  newTier: number;
  customQuotaLimit: number;
  paymentReference: string;
  isRenewal: boolean;
};

export type CancelSubscriptionPayload = {
  reason: string;
  effectiveDate: string; // ISO string, ví dụ: "2025-11-26T04:56:43.302Z"
};
