// hooks/support-requests/useAcceptSupportRequest.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { AcceptSupportRequestResponse } from "@/types/support/support-request.response";

export function useAcceptSupportRequest() {
  const [loading, setLoading] = useState(false);

  const acceptSupportRequest = useCallback(
    async (id: string): Promise<AcceptSupportRequestResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.acceptSupportRequest(id);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    acceptSupportRequest,
    loading,
  };
}
