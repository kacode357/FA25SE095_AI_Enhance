import type { SubscriptionTier } from "@/types/subscription/subscription.response";
import type { SubscriptionPaymentStatus } from "@/types/payments/payment.response";

interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface AdminSubscriptionPaymentsQuery extends DateRangeFilter {
  page?: number;
  pageSize?: number;
  userId?: string;
  tier?: SubscriptionTier;
  status?: SubscriptionPaymentStatus;
}

export interface AdminPaymentsQuery extends DateRangeFilter {
  page?: number;
  pageSize?: number;
  userId?: string;
  tierId?: string;
  status?: SubscriptionPaymentStatus;
}

export interface AdminPaymentsStatisticsQuery extends DateRangeFilter {
  tierId?: string;
}
