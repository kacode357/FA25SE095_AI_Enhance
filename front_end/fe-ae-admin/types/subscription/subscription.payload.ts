// types/subscription/subscription.payload.ts
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
  subscriptionTierId: string;
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
