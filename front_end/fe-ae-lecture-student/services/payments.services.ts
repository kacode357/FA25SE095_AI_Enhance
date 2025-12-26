// services/payments.services.ts

import { userAxiosInstance } from "@/config/axios.config";

import type {
  CreateSubscriptionPaymentPayload,
  ConfirmSubscriptionPaymentPayload,
  CancelSubscriptionPaymentPayload,
  PayOSWebhookPayload,
  PayOSReturnQuery,
  SubscriptionHistoryQuery,
} from "@/types/payments/payments.payload";

import type {
  CreateSubscriptionPaymentResponse,
  ConfirmSubscriptionPaymentResponse,
  CancelSubscriptionPaymentResponse,
  PayOSWebhookResponse,
  PayOSReturnResponse,
  SubscriptionHistoryResponse,
} from "@/types/payments/payments.response";

export const PaymentsService = {
  // Tạo payment cho subscription tier
  createSubscriptionPayment: async (
    payload: CreateSubscriptionPaymentPayload
  ): Promise<CreateSubscriptionPaymentResponse> => {
    const res =
      await userAxiosInstance.post<CreateSubscriptionPaymentResponse>(
        "/Payments/subscription",
        payload
      );
    return res.data;
  },

  // Confirm sau khi user thanh toán xong
  confirmSubscriptionPayment: async (
    payload: ConfirmSubscriptionPaymentPayload
  ): Promise<ConfirmSubscriptionPaymentResponse> => {
    const res =
      await userAxiosInstance.post<ConfirmSubscriptionPaymentResponse>(
        "/Payments/subscription/confirm",
        payload
      );
    return res.data;
  },

  cancelSubscriptionPayment: async (
    payload: CancelSubscriptionPaymentPayload
  ): Promise<CancelSubscriptionPaymentResponse> => {
    const res =
      await userAxiosInstance.post<CancelSubscriptionPaymentResponse>(
        "/Payments/subscription/cancel",
        payload
      );
    return res.data;
  },

  // Webhook này chuẩn ra chỉ nên dùng ở server
  handlePayOSWebhook: async (
    payload: PayOSWebhookPayload
  ): Promise<PayOSWebhookResponse> => {
    const res =
      await userAxiosInstance.post<PayOSWebhookResponse>(
        "/Payments/payos/webhook",
        payload
      );
    return res.data;
  },

  // Endpoint return, cần thì FE có thể call với query tương ứng
  getPayOSReturn: async (
    params: PayOSReturnQuery
  ): Promise<PayOSReturnResponse> => {
    const res =
      await userAxiosInstance.get<PayOSReturnResponse>(
        "/Payments/payos/return",
        { params }
      );
    return res.data;
  },
  getSubscriptionHistory: async (
    params: SubscriptionHistoryQuery
  ): Promise<SubscriptionHistoryResponse> => {
    const res = await userAxiosInstance.get<SubscriptionHistoryResponse>(
      "/Payments/subscription/history",
      { params }
    );
    return res.data;
  },
};
