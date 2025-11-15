"use client";

import { ReportsService } from "@/services/reports.services";
import { GetReportHistoryQuery } from "@/types/reports/reports.payload";
import {
    GetReportHistoryResponse,
} from "@/types/reports/reports.response";
import { useState } from "react";
import { toast } from "sonner";

export function useGetReportHistory() {
  const [loading, setLoading] = useState(false);

  const getReportHistory = async (
    params: GetReportHistoryQuery
  ): Promise<GetReportHistoryResponse | null> => {
    if (loading) return null;

    setLoading(true);
    try {
      const res = await ReportsService.getHistory(params);
      return res;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load history.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getReportHistory, loading };
}
