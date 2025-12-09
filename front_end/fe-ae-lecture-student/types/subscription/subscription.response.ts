// types/subscription/subscription.response.ts

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

export type GetSubscriptionResponse =
  BaseSubscriptionApiResponse<SubscriptionProfile>;

export type UpgradeSubscriptionResponse = BaseSubscriptionApiResponse<string>;

export type CancelSubscriptionResponse = BaseSubscriptionApiResponse<string>;

// ĐÚNG 100% JSON mày log từ BE
export type SubscriptionTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  quotaLimit: number;
  features: string[];
  isActive: boolean;
  tier: number;
  createdAt: string;
  updatedAt: string | null;
};

export type GetSubscriptionTiersResponse =
  BaseSubscriptionApiResponse<SubscriptionTier[]>;
