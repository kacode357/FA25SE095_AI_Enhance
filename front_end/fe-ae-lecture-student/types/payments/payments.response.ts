// types/payments/payments.response.ts

export type BasePaymentApiResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

// POST /api/Payments/subscription
export type CreateSubscriptionPaymentResponse =
  BasePaymentApiResponse<string>;

// POST /api/Payments/subscription/confirm
export type ConfirmSubscriptionPaymentResponse =
  BasePaymentApiResponse<string>;

// POST /api/Payments/payos/webhook
export type PayOSWebhookResponse = BasePaymentApiResponse<string>;

// GET /api/Payments/payos/return
export type PayOSReturnResponse = BasePaymentApiResponse<string>;
