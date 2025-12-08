"use client";

import { ReportsService } from "@/services/reports.services";
import type { AiCheckHistoryResponse } from "@/types/reports/reports.response";
import { useState } from "react";

export function useGetAiChecksReport() {
  const [loading, setLoading] = useState(false);

  const getAiChecks = async (reportId: string): Promise<AiCheckHistoryResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getAiChecks(reportId);
      return res;
    } catch (err: any) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getAiChecks, loading };
}
