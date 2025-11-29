// hooks/reports/useGetReportHistory.ts
"use client";

import { useCallback, useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { GetReportHistoryQuery } from "@/types/reports/reports.payload";
import type { GetReportHistoryResponse } from "@/types/reports/reports.response";

export function useGetReportHistory() {
  const [loading, setLoading] = useState(false);

  const getReportHistory = useCallback(
    async (
      params: GetReportHistoryQuery
    ): Promise<GetReportHistoryResponse | null> => {
      setLoading(true);
      try {
        const res = await ReportsService.getHistory(params);
        return res;
      } catch (err) {
        console.error("[reports] getReportHistory error", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { getReportHistory, loading };
}
