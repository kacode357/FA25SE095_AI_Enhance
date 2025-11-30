// services/payment.services.ts
import { userAxiosInstance } from "@/config/axios.config";

import type { AdminSubscriptionPaymentsQuery } from "@/types/payments/subscription-payment.payload";
import type {
  GetAdminSubscriptionPaymentsResponse,
  GetAdminSubscriptionPaymentsSummaryResponse,
} from "@/types/payments/subscription-payment.response";

export const PaymentService = {
  /** Admin: list subscription payments (paginated) */
  getAdminSubscriptionPayments: async (
    params?: AdminSubscriptionPaymentsQuery
  ): Promise<GetAdminSubscriptionPaymentsResponse> => {
    const query: Record<string, unknown> = {
      Page: params?.page,
      PageSize: params?.pageSize,
      UserId: params?.userId,
      Tier: params?.tier,     // enum SubscriptionTier (number dưới BE)
      Status: params?.status, // enum SubscriptionPaymentStatus
      From: params?.from,
      To: params?.to,
    };

    // clean undefined/null/empty string
    Object.keys(query).forEach((key) => {
      const v = query[key];
      if (v === undefined || v === null || v === "") {
        delete query[key];
      }
    });

    const res = await userAxiosInstance.get<GetAdminSubscriptionPaymentsResponse>(
      "/Payments/subscription/admin",
      { params: query }
    );

    return res.data;
  },

  /** Admin: summary (totalPayments, totalRevenue, status breakdown) */
  getAdminSubscriptionPaymentsSummary: async (
    params?: AdminSubscriptionPaymentsQuery
  ): Promise<GetAdminSubscriptionPaymentsSummaryResponse> => {
    const query: Record<string, unknown> = {
      UserId: params?.userId,
      Tier: params?.tier,
      Status: params?.status,
      From: params?.from,
      To: params?.to,
    };

    Object.keys(query).forEach((key) => {
      const v = query[key];
      if (v === undefined || v === null || v === "") {
        delete query[key];
      }
    });

    const res =
      await userAxiosInstance.get<GetAdminSubscriptionPaymentsSummaryResponse>(
        "/Payments/subscription/admin/summary",
        { params: query }
      );

    return res.data;
  },
};
