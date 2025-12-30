type ResponseEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

export interface SubscriptionTierItem {
  id: string;
  name: string;
  description: string;
  level: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export type GetSubscriptionTiersResponse =
  ResponseEnvelope<SubscriptionTierItem[]>;
export type GetSubscriptionTierResponse =
  ResponseEnvelope<SubscriptionTierItem>;
export type SubscriptionTierCommandResponse = ResponseEnvelope<string>;
