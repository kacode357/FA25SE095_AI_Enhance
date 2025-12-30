import { userAxiosInstance } from "@/config/axios.config";

import type {
  AdminPaymentsQuery,
  AdminPaymentsStatisticsQuery,
  AdminSubscriptionPaymentsQuery,
} from "@/types/payments/payment.payload";
import type {
  GetAdminPaymentsResponse,
  GetAdminPaymentsStatisticsResponse,
  GetAdminSubscriptionPaymentsResponse,
  GetAdminSubscriptionPaymentsSummaryResponse,
} from "@/types/payments/payment.response";

const cleanQuery = (query: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

const buildAdminSubscriptionQuery = (
  params?: AdminSubscriptionPaymentsQuery,
  includePagination = false
) =>
  cleanQuery({
    Page: includePagination ? params?.page : undefined,
    PageSize: includePagination ? params?.pageSize : undefined,
    UserId: params?.userId,
    Tier: params?.tier,
    Status: params?.status,
    From: params?.from,
    To: params?.to,
  });

const buildAdminPaymentsQuery = (
  params?: AdminPaymentsQuery,
  includePagination = false
) =>
  cleanQuery({
    Page: includePagination ? params?.page : undefined,
    PageSize: includePagination ? params?.pageSize : undefined,
    UserId: params?.userId,
    TierId: params?.tierId,
    Status: params?.status,
    From: params?.from,
    To: params?.to,
  });

const buildAdminPaymentsStatisticsQuery = (
  params?: AdminPaymentsStatisticsQuery
) =>
  cleanQuery({
    TierId: params?.tierId,
    From: params?.from,
    To: params?.to,
  });

export const PaymentService = {
  getAdminSubscriptionPayments: async (
    params?: AdminSubscriptionPaymentsQuery
  ): Promise<GetAdminSubscriptionPaymentsResponse> => {
    const res = await userAxiosInstance.get<GetAdminSubscriptionPaymentsResponse>(
      "/Payments/subscription/admin",
      { params: buildAdminSubscriptionQuery(params, true) }
    );
    return res.data;
  },

  getAdminSubscriptionPaymentsSummary: async (
    params?: AdminSubscriptionPaymentsQuery
  ): Promise<GetAdminSubscriptionPaymentsSummaryResponse> => {
    const res =
      await userAxiosInstance.get<GetAdminSubscriptionPaymentsSummaryResponse>(
        "/Payments/subscription/admin/summary",
        { params: buildAdminSubscriptionQuery(params) }
      );
    return res.data;
  },

  getAdminPayments: async (
    params?: AdminPaymentsQuery
  ): Promise<GetAdminPaymentsResponse> => {
    const res = await userAxiosInstance.get<GetAdminPaymentsResponse>(
      "/Admin/payments",
      { params: buildAdminPaymentsQuery(params, true) }
    );
    return res.data;
  },

  getAdminPaymentsStatistics: async (
    params?: AdminPaymentsStatisticsQuery
  ): Promise<GetAdminPaymentsStatisticsResponse> => {
    const res =
      await userAxiosInstance.get<GetAdminPaymentsStatisticsResponse>(
        "/Admin/payments/statistics",
        { params: buildAdminPaymentsStatisticsQuery(params) }
      );
    return res.data;
  },
};
