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

export type SubscriptionPaymentHistoryItem = {
  paymentId: string;
  orderCode: string;
  tier: number;
  status: number;
  amount: number;
  currency: string;
  checkoutUrl: string;
  paymentReference: string;
  failureReason: string | null;
  createdAt: string;
  expiredAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  userId: string;
  userEmail: string;
  userFullName: string;
};

// Cấu trúc phân trang trả về trong data
export type SubscriptionHistoryData = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: SubscriptionPaymentHistoryItem[];
};

// GET /api/Payments/subscription/history
export type SubscriptionHistoryResponse = BasePaymentApiResponse<SubscriptionHistoryData>;