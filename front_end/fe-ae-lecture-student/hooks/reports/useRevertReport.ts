// hooks/reports/useRevertReport.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { ReportsService } from "@/services/reports.services";
import type { RevertReportPayload } from "@/types/reports/reports.payload";
import type { RevertReportResponse } from "@/types/reports/reports.response";

export function useRevertReport() {
  const [loading, setLoading] = useState(false);

  const revertReport = useCallback(
    async (
      payload: RevertReportPayload
    ): Promise<RevertReportResponse | null> => {
      setLoading(true);
      try {
        const res = await ReportsService.revert(payload);

        if (res?.success) {
          toast.success(res.message || "Reverted report successfully.");
        }

        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { revertReport, loading };
}
