"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { ResubmitReportPayload } from "@/types/reports/reports.payload";
import type { ApiSuccess } from "@/types/reports/reports.response";

export function useResubmitReport() {
  const [loading, setLoading] = useState(false);

  const resubmitReport = async (
    payload: ResubmitReportPayload
  ): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.resubmit(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { resubmitReport, loading };
}
