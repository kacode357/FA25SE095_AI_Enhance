// types/payments/subscription-payment.payload.ts

import type { SubscriptionTier } from "@/types/subscription/subscription.response";
import type { SubscriptionPaymentStatus } from "@/types/payments/subscription-payment.response";

export interface AdminSubscriptionPaymentsQuery {
  page?: number;
  pageSize?: number;
  userId?: string;

  // filter Tier chuẩn theo enum BE
  tier?: SubscriptionTier;

  // filter status cũng dùng enum cho chặt
  status?: SubscriptionPaymentStatus;

  /**
   * ISO datetime string: "2025-11-30T11:51:23.4805521"
   */
  from?: string;

  /**
   * ISO datetime string
   */
  to?: string;
}
