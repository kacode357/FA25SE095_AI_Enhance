// services/subscription.services.ts

import { userAxiosInstance } from "@/config/axios.config";

import type {
  UpgradeSubscriptionPayload,
  CancelSubscriptionPayload,
} from "@/types/subscription/subscription.payload";

import type {
  GetSubscriptionResponse,
  UpgradeSubscriptionResponse,
  CancelSubscriptionResponse,
  GetSubscriptionTiersResponse,
} from "@/types/subscription/subscription.response";

export const SubscriptionService = {
  /** GET /api/Subscription – lấy thông tin subscription hiện tại của user */
  getCurrentSubscription: async (): Promise<GetSubscriptionResponse> => {
    const res = await userAxiosInstance.get<GetSubscriptionResponse>("/Subscription");
    return res.data;
  },

  /** POST /api/Subscription/upgrade – nâng cấp/đổi gói subscription */
  upgradeSubscription: async (
    payload: UpgradeSubscriptionPayload
  ): Promise<UpgradeSubscriptionResponse> => {
    const res = await userAxiosInstance.post<UpgradeSubscriptionResponse>(
      "/Subscription/upgrade",
      payload
    );
    return res.data;
  },

  /** POST /api/Subscription/cancel – hủy subscription */
  cancelSubscription: async (
    payload: CancelSubscriptionPayload
  ): Promise<CancelSubscriptionResponse> => {
    const res = await userAxiosInstance.post<CancelSubscriptionResponse>(
      "/Subscription/cancel",
      payload
    );
    return res.data;
  },

  /** GET /api/Subscription/tiers – danh sách các gói subscription */
  getSubscriptionTiers: async (): Promise<GetSubscriptionTiersResponse> => {
    const res =
      await userAxiosInstance.get<GetSubscriptionTiersResponse>("/Subscription/tiers");
    return res.data;
  },
};
