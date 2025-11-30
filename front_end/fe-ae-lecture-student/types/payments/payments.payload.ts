// types/payments/payments.payload.ts

// POST /api/Payments/subscription
export type CreateSubscriptionPaymentPayload = {
  tier: number;
  returnUrl: string;
  cancelUrl: string;
};

// POST /api/Payments/subscription/confirm
export type ConfirmSubscriptionPaymentPayload = {
  orderCode: string;
  token: string;
};

// POST /api/Payments/payos/webhook – dùng cho server, FE thường không gọi
export type PayOSWebhookData = {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId: string;
  counterAccountBankName: string;
  counterAccountName: string;
  counterAccountNumber: string;
  virtualAccountName: string;
  virtualAccountNumber: string;
};

export type PayOSWebhookPayload = {
  code: string;
  desc: string;
  success: boolean;
  data: PayOSWebhookData;
  signature: string;
};

// GET /api/Payments/payos/return – query từ PayOS redirect
export type PayOSReturnQuery = {
  Code?: string;
  Status?: string;
  Desc?: string;
  Message?: string;
  OrderCode?: string;
  Amount?: number;
  Signature?: string;
  TransactionId?: string;
  Reference?: string;
  ExtraData?: string;
  TargetUrl?: string;
  ConfirmationToken?: string;
};

export type SubscriptionHistoryQuery = {
  Page?: number;
  PageSize?: number;
  Tier?: number;   // 0: Free, 1: Basic, 2: Premium, 3: Enterprise
  Status?: number; // 0: Pending, 1: Processing, 2: Paid, 3: Failed, 4: Cancelled, 5: Expired
  From?: string;   // Date string (ISO)
  To?: string;     // Date string (ISO)
};