"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { GetSupportRequestByIdResponse, SupportRequestItem } from "@/types/support/support-request.response";

export function useSupportRequestById() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SupportRequestItem | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  const fetchSupportRequest = useCallback(
    async (id: string): Promise<GetSupportRequestByIdResponse> => {
      setLoading(true);
      setError(null);
      try {
        const res = await SupportRequestService.getSupportRequestById(id);
        setData(res.supportRequest || null);
        return res;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    data,
    error,
    fetchSupportRequest,
  };
}
