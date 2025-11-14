"use client";

import { ReportsService } from "@/services/reports.services";
import { RejectReportPayload } from "@/types/reports/reports.payload";
import { RejectReportResponse } from "@/types/reports/reports.response";
import { useState } from "react";
import { toast } from "sonner";

export function useRejectReport() {
  const [loading, setLoading] = useState(false);

  const rejectReport = async (
    payload: RejectReportPayload
  ): Promise<RejectReportResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.reject(payload);
      toast.success(res.message);
      return res;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject report");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rejectReport, loading };
}
