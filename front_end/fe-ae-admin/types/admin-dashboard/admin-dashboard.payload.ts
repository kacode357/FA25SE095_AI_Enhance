// types/admin-dashboard/admin-dashboard.payload.ts

export interface DashboardDateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export type DashboardInterval =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | string;

export interface DashboardIntervalQuery extends DashboardDateRangeQuery {
  interval?: DashboardInterval;
}

export interface DashboardRevenueQuery extends DashboardIntervalQuery {}

export interface DashboardPaymentsQuery extends DashboardIntervalQuery {}

export interface DashboardSubscriptionsQuery extends DashboardDateRangeQuery {}

export interface DashboardUsersQuery extends DashboardDateRangeQuery {
  quotaThreshold?: number;
}

export interface DashboardOverviewQuery extends DashboardIntervalQuery {}
