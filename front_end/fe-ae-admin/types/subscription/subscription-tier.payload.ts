export interface SubscriptionTierQuery {
  isActive?: boolean;
}

export interface CreateSubscriptionTierPayload {
  name: string;
  description: string;
  level: number;
  isActive: boolean;
}

export interface UpdateSubscriptionTierPayload {
  name: string;
  description: string;
  level: number;
  isActive: boolean;
}
