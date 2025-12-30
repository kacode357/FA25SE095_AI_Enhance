import { userAxiosInstance } from "@/config/axios.config";

import type {
  CreateSubscriptionTierPayload,
  SubscriptionTierQuery,
  UpdateSubscriptionTierPayload,
} from "@/types/subscription/subscription-tier.payload";
import type {
  GetSubscriptionTierResponse,
  GetSubscriptionTiersResponse,
  SubscriptionTierCommandResponse,
} from "@/types/subscription/subscription-tier.response";

const cleanQuery = (query: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

const buildSubscriptionTierQuery = (params?: SubscriptionTierQuery) =>
  cleanQuery({
    isActive: params?.isActive,
  });

export const SubscriptionTierService = {
  getSubscriptionTiers: async (
    params?: SubscriptionTierQuery
  ): Promise<GetSubscriptionTiersResponse> => {
    const res = await userAxiosInstance.get<GetSubscriptionTiersResponse>(
      "/SubscriptionTier",
      { params: buildSubscriptionTierQuery(params) }
    );
    return res.data;
  },

  getSubscriptionTierById: async (
    id: string
  ): Promise<GetSubscriptionTierResponse> => {
    const res = await userAxiosInstance.get<GetSubscriptionTierResponse>(
      `/SubscriptionTier/${id}`
    );
    return res.data;
  },

  createSubscriptionTier: async (
    payload: CreateSubscriptionTierPayload
  ): Promise<SubscriptionTierCommandResponse> => {
    const res = await userAxiosInstance.post<SubscriptionTierCommandResponse>(
      "/SubscriptionTier",
      payload
    );
    return res.data;
  },

  updateSubscriptionTier: async (
    id: string,
    payload: UpdateSubscriptionTierPayload
  ): Promise<SubscriptionTierCommandResponse> => {
    const res = await userAxiosInstance.put<SubscriptionTierCommandResponse>(
      `/SubscriptionTier/${id}`,
      payload
    );
    return res.data;
  },

  deleteSubscriptionTier: async (
    id: string
  ): Promise<SubscriptionTierCommandResponse> => {
    const res = await userAxiosInstance.delete<SubscriptionTierCommandResponse>(
      `/SubscriptionTier/${id}`
    );
    return res.data;
  },
};
