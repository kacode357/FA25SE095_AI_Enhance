// services/support-request.services.ts

import { courseAxiosInstance } from "@/config/axios.config";

import type {
  CreateSupportRequestPayload,
  GetMySupportRequestsQuery,
  GetPendingSupportRequestsQuery,
  GetAssignedSupportRequestsQuery,
} from "@/types/support/support-request.payload";

import type {
  CreateSupportRequestResponse,
  GetMySupportRequestsResponse,
  GetPendingSupportRequestsResponse,
  GetAssignedSupportRequestsResponse,
  AcceptSupportRequestResponse,
  CancelSupportRequestResponse,
  ResolveSupportRequestResponse,
} from "@/types/support/support-request.response";

export const SupportRequestService = {
  /** POST /api/SupportRequests – tạo mới support request (Student/Lecturer) */
  createSupportRequest: async (
    payload: CreateSupportRequestPayload
  ): Promise<CreateSupportRequestResponse> => {
    const res = await courseAxiosInstance.post<CreateSupportRequestResponse>(
      "/SupportRequests",
      payload
    );
    return res.data;
  },

  /** GET /api/SupportRequests/my – lấy các request của chính mình */
  getMySupportRequests: async (
    params?: GetMySupportRequestsQuery
  ): Promise<GetMySupportRequestsResponse> => {
    const res = await courseAxiosInstance.get<GetMySupportRequestsResponse>(
      "/SupportRequests/my",
      { params }
    );
    return res.data;
  },

  /** GET /api/SupportRequests/pending – list pending requests (Staff only) */
  getPendingSupportRequests: async (
    params?: GetPendingSupportRequestsQuery
  ): Promise<GetPendingSupportRequestsResponse> => {
    const res = await courseAxiosInstance.get<GetPendingSupportRequestsResponse>(
      "/SupportRequests/pending",
      { params }
    );
    return res.data;
  },

  /** GET /api/SupportRequests/assigned – list request đã được assign cho staff hiện tại */
  getAssignedSupportRequests: async (
    params?: GetAssignedSupportRequestsQuery
  ): Promise<GetAssignedSupportRequestsResponse> => {
    const res = await courseAxiosInstance.get<GetAssignedSupportRequestsResponse>(
      "/SupportRequests/assigned",
      { params }
    );
    return res.data;
  },

  /** POST /api/SupportRequests/{id}/accept – staff nhận xử lý 1 request */
  acceptSupportRequest: async (
    id: string
  ): Promise<AcceptSupportRequestResponse> => {
    const res = await courseAxiosInstance.post<AcceptSupportRequestResponse>(
      `/SupportRequests/${id}/accept`
    );
    return res.data;
  },

  /** PATCH /api/SupportRequests/{id} – requester cancel 1 request */
  cancelSupportRequest: async (
    id: string
  ): Promise<CancelSupportRequestResponse> => {
    const res = await courseAxiosInstance.patch<CancelSupportRequestResponse>(
      `/SupportRequests/${id}`
    );
    return res.data;
  },

  /** POST /api/SupportRequests/{id}/resolve – staff hoặc requester đánh dấu resolved */
  resolveSupportRequest: async (
    id: string
  ): Promise<ResolveSupportRequestResponse> => {
    const res = await courseAxiosInstance.post<ResolveSupportRequestResponse>(
      `/SupportRequests/${id}/resolve`
    );
    return res.data;
  },
};
