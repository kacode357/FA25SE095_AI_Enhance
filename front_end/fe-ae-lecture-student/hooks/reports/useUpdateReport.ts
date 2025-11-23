// hooks/reports/useUpdateReport.ts
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ReportsService } from "@/services/reports.services";
import type { UpdateReportPayload } from "@/types/reports/reports.payload";
import type { ApiSuccess } from "@/types/reports/reports.response";

export function useUpdateReport() {
  const [loading, setLoading] = useState(false);

  const updateReport = async (
    id: string,
    payload: UpdateReportPayload
  ): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);

    try {
      const res = await ReportsService.update(id, payload);

      if (res?.success) {
      
        toast.success(res.message);
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  return { updateReport, loading };
}
