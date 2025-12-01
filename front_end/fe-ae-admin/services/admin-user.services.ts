// services/admin-user.services.ts
import { userAxiosInstance } from "@/config/axios.config";

import type {
  AdminUsersQuery,
  SuspendAdminUserPayload,
  UpdateAdminUserQuotaPayload,
} from "@/types/admin/admin-user.payload";

import type {
  GetAdminUsersResponse,
  GetAdminUserByIdResponse,
  GetPendingApprovalUsersResponse,
  ApproveAdminUserResponse,
  SuspendAdminUserResponse,
  ReactivateAdminUserResponse,
  UpdateAdminUserQuotaResponse,
  ResetAdminUserQuotaResponse,
} from "@/types/admin/admin-user.response";

export const AdminUserService = {
  /** GET /api/Admin/users */
  getAdminUsers: async (
    params?: AdminUsersQuery
  ): Promise<GetAdminUsersResponse> => {
    const query: Record<string, unknown> = {
      Page: params?.page,
      PageSize: params?.pageSize,
      SearchTerm: params?.searchTerm,
      Role: params?.role,
      Status: params?.status,
      SubscriptionTier: params?.subscriptionTier,
      SortBy: params?.sortBy,
      SortOrder: params?.sortOrder,
      Emails: params?.emails,
    };

    Object.keys(query).forEach((key) => {
      const v = query[key];
      if (
        v === undefined ||
        v === null ||
        (Array.isArray(v) && v.length === 0)
      ) {
        delete query[key];
      }
    });

    const res = await userAxiosInstance.get<GetAdminUsersResponse>(
      "/Admin/users",
      { params: query }
    );
    return res.data;
  },

  /** GET /api/Admin/users/{userId} */
  getAdminUserById: async (
    userId: string
  ): Promise<GetAdminUserByIdResponse> => {
    const res = await userAxiosInstance.get<GetAdminUserByIdResponse>(
      `/Admin/users/${userId}`
    );
    return res.data;
  },

  /** POST /api/Admin/users/{userId}/approve */
  approveAdminUser: async (
    userId: string
  ): Promise<ApproveAdminUserResponse> => {
    const res = await userAxiosInstance.post<ApproveAdminUserResponse>(
      `/Admin/users/${userId}/approve`
    );
    return res.data;
  },

  /** POST /api/Admin/users/{userId}/suspend */
  suspendAdminUser: async (
    userId: string,
    payload: SuspendAdminUserPayload
  ): Promise<SuspendAdminUserResponse> => {
    const res = await userAxiosInstance.post<SuspendAdminUserResponse>(
      `/Admin/users/${userId}/suspend`,
      payload
    );
    return res.data;
  },

  /** POST /api/Admin/users/{userId}/reactivate */
  reactivateAdminUser: async (
    userId: string
  ): Promise<ReactivateAdminUserResponse> => {
    const res = await userAxiosInstance.post<ReactivateAdminUserResponse>(
      `/Admin/users/${userId}/reactivate`
    );
    return res.data;
  },

  /** PUT /api/Admin/users/{userId}/quota */
  updateAdminUserQuota: async (
    userId: string,
    payload: UpdateAdminUserQuotaPayload
  ): Promise<UpdateAdminUserQuotaResponse> => {
    const res = await userAxiosInstance.put<UpdateAdminUserQuotaResponse>(
      `/Admin/users/${userId}/quota`,
      payload
    );
    return res.data;
  },

  /** POST /api/Admin/users/{userId}/quota/reset */
  resetAdminUserQuota: async (
    userId: string
  ): Promise<ResetAdminUserQuotaResponse> => {
    const res = await userAxiosInstance.post<ResetAdminUserQuotaResponse>(
      `/Admin/users/${userId}/quota/reset`
    );
    return res.data;
  },

  /** GET /api/Admin/users/pending-approval */
  getPendingApprovalUsers: async (): Promise<GetPendingApprovalUsersResponse> => {
    const res =
      await userAxiosInstance.get<GetPendingApprovalUsersResponse>(
        "/Admin/users/pending-approval"
      );
    return res.data;
  },
};
