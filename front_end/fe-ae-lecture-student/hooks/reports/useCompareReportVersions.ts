"use client";

import { ReportsService } from "@/services/reports.services";
import {
    CompareReportVersionsPayload,
} from "@/types/reports/reports.payload";
import {
    CompareReportVersionsResponse,
} from "@/types/reports/reports.response";
import { useState } from "react";
import { toast } from "sonner";

export function useCompareReportVersions() {
  const [loading, setLoading] = useState(false);

  const compareReportVersions = async (
    params: CompareReportVersionsPayload
  ): Promise<CompareReportVersionsResponse | null> => {
    if (loading) return null;

    setLoading(true);
    try {
      const res = await ReportsService.compareVersions(params);
      return res;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to compare versions.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { compareReportVersions, loading };
}
