// hooks/support-requests/useCreateSupportRequest.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { CreateSupportRequestPayload } from "@/types/support/support-request.payload";
import type { CreateSupportRequestResponse } from "@/types/support/support-request.response";

export function useCreateSupportRequest() {
  const [loading, setLoading] = useState(false);

  const createSupportRequest = useCallback(
    async (
      payload: CreateSupportRequestPayload
    ): Promise<CreateSupportRequestResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.createSupportRequest(payload);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createSupportRequest,
    loading,
  };
}
