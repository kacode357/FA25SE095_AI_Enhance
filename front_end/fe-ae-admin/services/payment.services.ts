import { userAxiosInstance } from "@/config/axios.config";

import type { AdminSubscriptionPaymentsQuery } from "@/types/payments/payment.payload";
import type {
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
};
