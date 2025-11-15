"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ReportsService } from "@/services/reports.services";
import { GetReportHistoryVersionPayload } from "@/types/reports/reports.payload";
import { GetReportHistoryVersionResponse } from "@/types/reports/reports.response";

export function useGetReportHistoryVersion() {
  const [loading, setLoading] = useState(false);

  const getReportHistoryVersion = async (
    params: GetReportHistoryVersionPayload
  ): Promise<GetReportHistoryVersionResponse | null> => {
    if (loading) return null;

    setLoading(true);
    try {
      const res = await ReportsService.getHistoryVersion(params);
      return res;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load history version.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getReportHistoryVersion, loading };
}
