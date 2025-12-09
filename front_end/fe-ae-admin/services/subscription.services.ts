// services/subscription.services.ts
import { userAxiosInstance } from "@/config/axios.config";

import type {
  CreateSubscriptionPlanPayload,
  SubscriptionPlansQuery,
  UpdateSubscriptionPlanPayload,
} from "@/types/subscription/subscription.payload";
import type {
  GetSubscriptionPlansResponse,
  SubscriptionCommandResponse,
} from "@/types/subscription/subscription.response";

const cleanQuery = (query: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

const buildSubscriptionPlansQuery = (params?: SubscriptionPlansQuery) =>
  cleanQuery({
    isActive: params?.isActive,
  });

export const SubscriptionService = {
  getSubscriptionPlans: async (
    params?: SubscriptionPlansQuery
  ): Promise<GetSubscriptionPlansResponse> => {
    const res = await userAxiosInstance.get<GetSubscriptionPlansResponse>(
      "/Subscription/plans",
      { params: buildSubscriptionPlansQuery(params) }
    );

    return res.data;
  },

  createSubscriptionPlan: async (
    payload: CreateSubscriptionPlanPayload
  ): Promise<SubscriptionCommandResponse> => {
    const res = await userAxiosInstance.post<SubscriptionCommandResponse>(
      "/Subscription/plan",
      payload
    );

    return res.data;
  },

  updateSubscriptionPlan: async (
    id: string,
    payload: UpdateSubscriptionPlanPayload
  ): Promise<SubscriptionCommandResponse> => {
    const res = await userAxiosInstance.put<SubscriptionCommandResponse>(
      `/Subscription/plan/${id}`,
      payload
    );

    return res.data;
  },

  toggleSubscriptionPlan: async (
    id: string
  ): Promise<SubscriptionCommandResponse> => {
    const res = await userAxiosInstance.patch<SubscriptionCommandResponse>(
      `/Subscription/plan/${id}/toggle`
    );

    return res.data;
  },
};
