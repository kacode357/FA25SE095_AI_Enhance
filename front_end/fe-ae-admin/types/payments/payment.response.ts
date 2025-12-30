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

type ResponseEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

type StatusBreakdownKey = keyof typeof SubscriptionPaymentStatus;

export type SubscriptionPaymentsStatusBreakdown = Record<
  StatusBreakdownKey,
  number
>;

export interface SubscriptionPaymentsSummary {
  totalPayments: number;
  totalRevenue: number;
  statusBreakdown: SubscriptionPaymentsStatusBreakdown;
}

export type GetAdminSubscriptionPaymentsResponse =
  ResponseEnvelope<PaginatedSubscriptionPayments>;
export type GetAdminSubscriptionPaymentsSummaryResponse =
  ResponseEnvelope<SubscriptionPaymentsSummary>;

export interface AdminPaymentItem {
  paymentId: string;
  orderCode: string;
  tierId: string;
  tierName: string;
  tierLevel: number;
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

export interface PaginatedAdminPayments {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: AdminPaymentItem[];
}

export interface AdminPaymentsStatistics {
  totalPayments: number;
  totalRevenue: number;
  statusBreakdown: SubscriptionPaymentsStatusBreakdown;
}

export type GetAdminPaymentsResponse =
  ResponseEnvelope<PaginatedAdminPayments>;
export type GetAdminPaymentsStatisticsResponse =
  ResponseEnvelope<AdminPaymentsStatistics>;
