// types/payments/subscription-payment.response.ts

import type { SubscriptionTier } from "@/types/subscription/subscription.response";

export enum SubscriptionPaymentStatus {
  Pending = 0,
  Processing = 1,
  Paid = 2,
  Failed = 3,
  Cancelled = 4,
  Expired = 5,
}

export interface SubscriptionPaymentItem {
  paymentId: string;
  orderCode: string;

  // match BE SubscriptionTier
  tier: SubscriptionTier;

  status: SubscriptionPaymentStatus;
  amount: number;
  currency: string;
  checkoutUrl: string;
  paymentReference: string;
  failureReason: string | null;
  createdAt: string;
  expiredAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  userId: string;
  userEmail: string;
  userFullName: string;
}

export interface PaginatedSubscriptionPayments {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: SubscriptionPaymentItem[];
}

export interface GetAdminSubscriptionPaymentsResponse {
  status: number;  // 200
  message: string; // "Subscription payments retrieved"
  data: PaginatedSubscriptionPayments;
}

export interface SubscriptionPaymentsStatusBreakdown {
  Pending: number;
  Processing: number;
  Paid: number;
  Failed: number;
  Cancelled: number;
  Expired: number;
}

export interface SubscriptionPaymentsSummary {
  totalPayments: number;
  totalRevenue: number;
  statusBreakdown: SubscriptionPaymentsStatusBreakdown;
}

export interface GetAdminSubscriptionPaymentsSummaryResponse {
  status: number;  // 200
  message: string; // "Subscription payment summary"
  data: SubscriptionPaymentsSummary;
}
