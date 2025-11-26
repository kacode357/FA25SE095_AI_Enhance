export type BaseSubscriptionApiResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

export interface SubscriptionProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  status: string;
  subscriptionTier: string;
  isEmailConfirmed: boolean;
  emailConfirmedAt: string | null;
  lastLoginAt: string | null;
  crawlQuotaUsed: number;
  crawlQuotaLimit: number;
  quotaResetDate: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  institutionName: string | null;
  institutionAddress: string | null;
  studentId: string | null;
  department: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GetSubscriptionResponse = BaseSubscriptionApiResponse<SubscriptionProfile>;

export type UpgradeSubscriptionResponse = BaseSubscriptionApiResponse<string>;

export type CancelSubscriptionResponse = BaseSubscriptionApiResponse<string>;

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
