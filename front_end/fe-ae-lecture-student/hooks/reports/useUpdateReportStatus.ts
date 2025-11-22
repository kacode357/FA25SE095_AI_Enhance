// hooks/reports/useUpdateReportStatus.ts
"use client";

import { useCallback, useState } from "react";

import { ReportsService } from "@/services/reports.services";
import type {
  UpdateReportStatusPayload,
} from "@/types/reports/reports.payload";
import type {
  UpdateReportStatusResponse,
} from "@/types/reports/reports.response";

export function useUpdateReportStatus() {
  const [loading, setLoading] = useState(false);

  const updateReportStatus = useCallback(
    async (
      id: string,
      payload: UpdateReportStatusPayload
    ): Promise<UpdateReportStatusResponse> => {
      setLoading(true);
      try {
        const res = await ReportsService.updateStatus(id, payload);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    updateReportStatus,
  };
}
