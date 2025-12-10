// services/admin-dashboard.services.ts
import { userAxiosInstance } from "@/config/axios.config";

import type {
  DashboardOverviewQuery,
  DashboardPaymentsQuery,
  DashboardRevenueQuery,
  DashboardSubscriptionsQuery,
  DashboardUsersQuery,
  DashboardDateRangeQuery,
  DashboardIntervalQuery,
} from "@/types/admin-dashboard/admin-dashboard.payload";
import type {
  GetDashboardOverviewResponse,
  GetDashboardPaymentsResponse,
  GetDashboardRevenueResponse,
  GetDashboardSubscriptionsResponse,
  GetDashboardUsersResponse,
} from "@/types/admin-dashboard/admin-dashboard.response";

const cleanQuery = (query: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
    )
  );

const buildDateRangeQuery = (params?: DashboardDateRangeQuery) =>
  cleanQuery({
    startDate: params?.startDate,
    endDate: params?.endDate,
  });

const buildIntervalQuery = (params?: DashboardIntervalQuery) =>
  cleanQuery({
    startDate: params?.startDate,
    endDate: params?.endDate,
    interval: params?.interval,
  });

const buildUsersQuery = (params?: DashboardUsersQuery) =>
  cleanQuery({
    startDate: params?.startDate,
    endDate: params?.endDate,
    quotaThreshold: params?.quotaThreshold,
  });

export const AdminDashboardService = {
  /** GET /api/admin/dashboard/revenue */
  getRevenue: async (
    params?: DashboardRevenueQuery
  ): Promise<GetDashboardRevenueResponse> => {
    const res = await userAxiosInstance.get<GetDashboardRevenueResponse>(
      "/admin/dashboard/revenue",
      { params: buildIntervalQuery(params) }
    );
    return res.data;
  },

  /** GET /api/admin/dashboard/payments */
  getPayments: async (
    params?: DashboardPaymentsQuery
  ): Promise<GetDashboardPaymentsResponse> => {
    const res = await userAxiosInstance.get<GetDashboardPaymentsResponse>(
      "/admin/dashboard/payments",
      { params: buildIntervalQuery(params) }
    );
    return res.data;
  },

  /** GET /api/admin/dashboard/subscriptions */
  getSubscriptions: async (
    params?: DashboardSubscriptionsQuery
  ): Promise<GetDashboardSubscriptionsResponse> => {
    const res =
      await userAxiosInstance.get<GetDashboardSubscriptionsResponse>(
        "/admin/dashboard/subscriptions",
        { params: buildDateRangeQuery(params) }
      );
    return res.data;
  },

  /** GET /api/admin/dashboard/users */
  getUsers: async (
    params?: DashboardUsersQuery
  ): Promise<GetDashboardUsersResponse> => {
    const res = await userAxiosInstance.get<GetDashboardUsersResponse>(
      "/admin/dashboard/users",
      { params: buildUsersQuery(params) }
    );
    return res.data;
  },

  /** GET /api/admin/dashboard/overview */
  getOverview: async (
    params?: DashboardOverviewQuery
  ): Promise<GetDashboardOverviewResponse> => {
    const res = await userAxiosInstance.get<GetDashboardOverviewResponse>(
      "/admin/dashboard/overview",
      { params: buildIntervalQuery(params) }
    );
    return res.data;
  },
};
