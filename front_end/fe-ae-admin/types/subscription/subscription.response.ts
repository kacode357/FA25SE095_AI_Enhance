// types/subscription/subscription.response.ts

export enum SubscriptionTier {
  Free = 0,
  Basic = 1,
  Premium = 2,
  Enterprise = 3,
}

type ResponseEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  quotaLimit: number;
  features: string[];
  isActive: boolean;
  subscriptionTierId: string;
  subscriptionTierName?: string | null;
  subscriptionTierLevel?: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export type GetSubscriptionPlansResponse = ResponseEnvelope<SubscriptionPlan[]>;

// Backend trả "data": "string" cho các lệnh command (POST/PUT/PATCH)
// nên tao để generic string cho chắc, sau này muốn đổi thì sửa ở đây.
export type SubscriptionCommandResponse = ResponseEnvelope<string>;
