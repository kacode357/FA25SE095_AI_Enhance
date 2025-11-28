// hooks/reports/useGetReportHistoryVersion.ts
"use client";

import { useCallback, useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { GetReportHistoryVersionPayload } from "@/types/reports/reports.payload";
import type { GetReportHistoryVersionResponse } from "@/types/reports/reports.response";

export function useGetReportHistoryVersion() {
  const [loading, setLoading] = useState(false);

  const getReportHistoryVersion = useCallback(
    async (
      payload: GetReportHistoryVersionPayload
    ): Promise<GetReportHistoryVersionResponse | null> => {
      setLoading(true);
      try {
        const res = await ReportsService.getHistoryVersion(payload);
        return res;
      } catch (err) {
        console.error("[reports] getReportHistoryVersion error", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { getReportHistoryVersion, loading };
}
