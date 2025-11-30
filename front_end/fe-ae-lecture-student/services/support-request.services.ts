import { courseAxiosInstance } from "@/config/axios.config";

import type {
  CreateSupportRequestPayload,
  GetMySupportRequestsQuery,
  GetPendingSupportRequestsQuery,
  GetAssignedSupportRequestsQuery,
  RejectSupportRequestPayload,
} from "@/types/support/support-request.payload";

import type {
  CreateSupportRequestResponse,
  GetMySupportRequestsResponse,
  GetPendingSupportRequestsResponse,
  GetAssignedSupportRequestsResponse,
  AcceptSupportRequestResponse,
  CancelSupportRequestResponse,
  ResolveSupportRequestResponse,
  RejectSupportRequestResponse,
  UploadSupportRequestImagesResponse,
} from "@/types/support/support-request.response";

export const SupportRequestService = {
   createSupportRequest: async (
    payload: CreateSupportRequestPayload
  ): Promise<CreateSupportRequestResponse> => {
    const formData = new FormData();

    formData.append("courseId", payload.courseId);
    formData.append("priority", String(payload.priority));
    formData.append("category", String(payload.category));
    formData.append("subject", payload.subject);
    formData.append("description", payload.description);

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    const res = await courseAxiosInstance.post<CreateSupportRequestResponse>(
      "/SupportRequests",
      formData,
      {
        headers: {
          // QUAN TRỌNG: override default JSON
          "Content-Type": "multipart/form-data",
          Accept: "text/plain",
        },
      }
    );

    return res.data;
  },

  getMySupportRequests: async (
    params?: GetMySupportRequestsQuery
  ): Promise<GetMySupportRequestsResponse> => {
    const res = await courseAxiosInstance.get<GetMySupportRequestsResponse>(
      "/SupportRequests/my",
      { params }
    );
    return res.data;
  },

  getPendingSupportRequests: async (
    params?: GetPendingSupportRequestsQuery
  ): Promise<GetPendingSupportRequestsResponse> => {
    const res =
      await courseAxiosInstance.get<GetPendingSupportRequestsResponse>(
        "/SupportRequests/pending",
        { params }
      );
    return res.data;
  },

  getAssignedSupportRequests: async (
    params?: GetAssignedSupportRequestsQuery
  ): Promise<GetAssignedSupportRequestsResponse> => {
    const res =
      await courseAxiosInstance.get<GetAssignedSupportRequestsResponse>(
        "/SupportRequests/assigned",
        { params }
      );
    return res.data;
  },

  acceptSupportRequest: async (
    id: string
  ): Promise<AcceptSupportRequestResponse> => {
    const res = await courseAxiosInstance.post<AcceptSupportRequestResponse>(
      `/SupportRequests/${id}/accept`
    );
    return res.data;
  },

  cancelSupportRequest: async (
    id: string
  ): Promise<CancelSupportRequestResponse> => {
    const res = await courseAxiosInstance.patch<CancelSupportRequestResponse>(
      `/SupportRequests/${id}`
    );
    return res.data;
  },

  rejectSupportRequest: async (
    id: string,
    payload: Omit<RejectSupportRequestPayload, "supportRequestId">
  ): Promise<RejectSupportRequestResponse> => {
    const body: RejectSupportRequestPayload = {
      supportRequestId: id,
      rejectionReason: payload.rejectionReason,
      rejectionComments: payload.rejectionComments,
    };

    const res = await courseAxiosInstance.post<RejectSupportRequestResponse>(
      `/SupportRequests/${id}/reject`,
      body
    );
    return res.data;
  },

  resolveSupportRequest: async (
    id: string
  ): Promise<ResolveSupportRequestResponse> => {
    const res = await courseAxiosInstance.post<ResolveSupportRequestResponse>(
      `/SupportRequests/${id}/resolve`
    );
    return res.data;
  },
 uploadSupportRequestImages: async (
    id: string,
    images: File[]
  ): Promise<UploadSupportRequestImagesResponse> => {
    const formData = new FormData();

    images.forEach((file) => {
      formData.append("images", file, file.name);
    });

    const res =
      await courseAxiosInstance.post<UploadSupportRequestImagesResponse>(
        `/SupportRequests/${id}/upload-images`,
        formData,
        {
          headers: {
            // giống curl mẫu trong swagger
            "Content-Type": "multipart/form-data",
            Accept: "text/plain",
          },
        }
      );

    return res.data;
  },
};
