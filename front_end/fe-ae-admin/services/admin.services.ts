// services/admin.services.ts
import { userAxiosInstance } from "@/config/axios.config";
import {
  PendingApprovalParams,
  SuspendUserPayload,
  GetUsersParams,
} from "@/types/admin/admin.payload";
import {
  PendingApprovalResponse,
  ApproveUserResponse,
  SuspendUserResponse,
  AdminGetUsersResponse,
  AdminUserDetailResponse,
  ReactivateUserResponse, // ✅ thêm
} from "@/types/admin/admin.response";

export const AdminService = {
  /** ==== Pending Approval ==== */
  getPendingApprovalUsers: async (
    params?: PendingApprovalParams
  ): Promise<PendingApprovalResponse> => {
    const response = await userAxiosInstance.get<PendingApprovalResponse>(
      "/Admin/users/pending-approval",
      { params }
    );
    return response.data;
  },

  approveUser: async (userId: string): Promise<ApproveUserResponse> => {
    const response = await userAxiosInstance.post<ApproveUserResponse>(
      `/Admin/users/${userId}/approve`
    );
    return response.data;
  },

  suspendUser: async (
    userId: string,
    data: SuspendUserPayload
  ): Promise<SuspendUserResponse> => {
    const response = await userAxiosInstance.post<SuspendUserResponse>(
      `/Admin/users/${userId}/suspend`,
      data
    );
    return response.data;
  },

  reactivateUser: async (userId: string): Promise<ReactivateUserResponse> => {
    const response = await userAxiosInstance.post<ReactivateUserResponse>(
      `/Admin/users/${userId}/reactivate`
    );
    return response.data;
  },

  /** ==== User Management ==== */
  getUsers: async (params?: GetUsersParams): Promise<AdminGetUsersResponse> => {
    const response = await userAxiosInstance.get<AdminGetUsersResponse>(
      "/Admin/users",
      { params }
    );
    return response.data;
  },

  getUserById: async (userId: string): Promise<AdminUserDetailResponse> => {
    const response = await userAxiosInstance.get<AdminUserDetailResponse>(
      `/Admin/users/${userId}`
    );
    return response.data;
  },
};