// services/payments.services.ts

import { courseAxiosInstance } from "@/config/axios.config";

import type {
  CreateSubscriptionPaymentPayload,
  ConfirmSubscriptionPaymentPayload,
  PayOSWebhookPayload,
  PayOSReturnQuery,
} from "@/types/payments/payments.payload";

import type {
  CreateSubscriptionPaymentResponse,
  ConfirmSubscriptionPaymentResponse,
  PayOSWebhookResponse,
  PayOSReturnResponse,
} from "@/types/payments/payments.response";

export const PaymentsService = {
  // Tạo payment cho subscription tier
  createSubscriptionPayment: async (
    payload: CreateSubscriptionPaymentPayload
  ): Promise<CreateSubscriptionPaymentResponse> => {
    const res =
      await courseAxiosInstance.post<CreateSubscriptionPaymentResponse>(
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
      await courseAxiosInstance.post<ConfirmSubscriptionPaymentResponse>(
        "/Payments/subscription/confirm",
        payload
      );
    return res.data;
  },

  // Webhook này chuẩn ra chỉ nên dùng ở server
  handlePayOSWebhook: async (
    payload: PayOSWebhookPayload
  ): Promise<PayOSWebhookResponse> => {
    const res =
      await courseAxiosInstance.post<PayOSWebhookResponse>(
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
      await courseAxiosInstance.get<PayOSReturnResponse>(
        "/Payments/payos/return",
        { params }
      );
    return res.data;
  },
};
