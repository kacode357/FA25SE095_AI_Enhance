// types/admin-dashboard/admin-dashboard.response.ts

type ResponseEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

export interface RevenueGrowth {
  percentage: number;
  comparedTo: string;
  previousPeriodRevenue: number;
  currentPeriodRevenue: number;
}

export interface RevenueTimelinePoint {
  date: string;
  revenue: number;
  orders?: number;
  averageOrderValue?: number;
}

export interface RevenueStatistics {
  totalRevenue: number;
  currency: string;
  revenueByTier: Record<string, number>;
  timeline: RevenueTimelinePoint[];
  growth: RevenueGrowth;
  averageRevenuePerUser: number;
  averageOrderValue: number;
}

export type PaymentStatusDistribution = Record<string, number>;

export interface FailedPaymentInfo {
  paymentId?: string;
  orderCode?: string;
  amount?: number;
  currency?: string;
  failureReason?: string | null;
  status?: string;
  occurredAt?: string;
  userId?: string;
  userEmail?: string;
}

export interface PaymentTimelinePoint {
  date: string;
  totalOrders: number;
  successfulOrders?: number;
  failedOrders?: number;
  successRate?: number;
}

export interface PaymentStatistics {
  totalOrders: number;
  newOrders: number;
  statusDistribution: PaymentStatusDistribution;
  successRate: number;
  failedPayments: FailedPaymentInfo[];
  timeline: PaymentTimelinePoint[];
  averageProcessingTime: number;
}

export type SubscriptionTierDistribution = Record<string, number>;

export interface SubscriptionUpgradeDowngradeStats {
  upgrades: number;
  downgrades: number;
  netChange: number;
}

export interface SubscriptionTimelinePoint {
  date: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  activeTotal: number;
}

export interface SubscriptionStatistics {
  totalActiveSubscriptions: number;
  subscriptionsByTier: SubscriptionTierDistribution;
  newSubscriptions: number;
  churnRate: number;
  renewalRate: number;
  upgradeDowngrade: SubscriptionUpgradeDowngradeStats;
  timeline: SubscriptionTimelinePoint[];
  averageSubscriptionValue: number;
}

export type UsersByTier = Record<string, number>;
export type UsersByRole = Record<string, number>;

export interface UserNearQuota {
  userId: string;
  email: string;
  usagePercentage: number;
  quotaUsed: number;
  quotaLimit: number;
  tier?: string;
  role?: string;
  fullName?: string | null;
}

export interface UserTimelinePoint {
  date: string;
  newUsers: number;
  totalUsers: number;
  paidUsers: number;
}

export interface UserStatistics {
  totalUsers: number;
  usersByTier: UsersByTier;
  usersByRole: UsersByRole;
  newUsers: number;
  activeUsers: number;
  conversionRate: number;
  averageLifetimeValue: number;
  timeline: UserTimelinePoint[];
  usersNearQuota: UserNearQuota[];
}

export interface DashboardPeriod {
  startDate: string;
  endDate: string;
  description?: string;
}

export interface DashboardOverviewData {
  period: DashboardPeriod;
  revenue: RevenueStatistics;
  payments: PaymentStatistics;
  subscriptions: SubscriptionStatistics;
  users: UserStatistics;
  generatedAt: string;
}

export type GetDashboardRevenueResponse = ResponseEnvelope<RevenueStatistics>;
export type GetDashboardPaymentsResponse = ResponseEnvelope<PaymentStatistics>;
export type GetDashboardSubscriptionsResponse =
  ResponseEnvelope<SubscriptionStatistics>;
export type GetDashboardUsersResponse = ResponseEnvelope<UserStatistics>;
export type GetDashboardOverviewResponse = ResponseEnvelope<DashboardOverviewData>;
