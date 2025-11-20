// hooks/support-requests/useRejectSupportRequest.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { RejectSupportRequestResponse } from "@/types/support/support-request.response";

/** Input cho hook – không cần truyền supportRequestId vì đã có id trên route */
export type RejectSupportRequestInput = {
  /** Map với SupportRequestRejectionReason enum bên FE/BE */
  rejectionReason: number;
  /** Ghi chú thêm (optional) */
  rejectionComments?: string;
};

export function useRejectSupportRequest() {
  const [loading, setLoading] = useState(false);

  const rejectSupportRequest = useCallback(
    async (
      id: string,
      payload: RejectSupportRequestInput
    ): Promise<RejectSupportRequestResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.rejectSupportRequest(id, {
          rejectionReason: payload.rejectionReason,
          rejectionComments: payload.rejectionComments,
        });
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    rejectSupportRequest,
    loading,
  };
}
