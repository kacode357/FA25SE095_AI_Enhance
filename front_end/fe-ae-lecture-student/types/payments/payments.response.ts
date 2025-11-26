// types/payments/payments.response.ts

export type BasePaymentApiResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

// Dữ liệu trả về khi tạo payment link subscription
export type SubscriptionPaymentLink = {
  paymentId: string;
  paymentLinkId: string;
  orderCode: string;
  checkoutUrl: string;
  qrCode: string;
  amount: number;
  currency: string;
  expiresAt: string;
  confirmationToken: string;
};

// POST /api/Payments/subscription
export type CreateSubscriptionPaymentResponse =
  BasePaymentApiResponse<SubscriptionPaymentLink>;

// POST /api/Payments/subscription/confirm
export type ConfirmSubscriptionPaymentResponse =
  BasePaymentApiResponse<string>;

// POST /api/Payments/payos/webhook
export type PayOSWebhookResponse = BasePaymentApiResponse<string>;

// GET /api/Payments/payos/return
export type PayOSReturnResponse = BasePaymentApiResponse<string>;
