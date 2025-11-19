// hooks/support-requests/useCancelSupportRequest.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { CancelSupportRequestResponse } from "@/types/support/support-request.response";

export function useCancelSupportRequest() {
  const [loading, setLoading] = useState(false);

  const cancelSupportRequest = useCallback(
    async (id: string): Promise<CancelSupportRequestResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.cancelSupportRequest(id);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    cancelSupportRequest,
    loading,
  };
}
