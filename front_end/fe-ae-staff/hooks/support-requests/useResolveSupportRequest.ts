// hooks/support-requests/useResolveSupportRequest.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { ResolveSupportRequestResponse } from "@/types/support/support-request.response";

export function useResolveSupportRequest() {
  const [loading, setLoading] = useState(false);

  const resolveSupportRequest = useCallback(
    async (id: string): Promise<ResolveSupportRequestResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.resolveSupportRequest(id);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    resolveSupportRequest,
    loading,
  };
}
