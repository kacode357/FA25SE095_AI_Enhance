"use client";

import { ReportsService } from "@/services/reports.services";
import { RequestReportRevisionPayload } from "@/types/reports/reports.payload";
import { RequestReportRevisionResponse } from "@/types/reports/reports.response";
import { useState } from "react";
import { toast } from "sonner";

export function useRequestReportRevision() {
  const [loading, setLoading] = useState(false);

  const requestReportRevision = async (
    payload: RequestReportRevisionPayload
  ): Promise<RequestReportRevisionResponse | null> => {
    try {
      setLoading(true);
      const res = await ReportsService.requestRevision(payload);

      if (res.success) {
        toast.success("Report sent back for revision.");
      } else {
        toast.error(res.message || "Failed to request revision.");
      }

      return res;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { requestReportRevision, loading };
}
