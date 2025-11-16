// hooks/reports/useSubmitDraftReport.ts
"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { ApiSuccess } from "@/types/reports/reports.response";

export function useSubmitDraftReport() {
  const [loading, setLoading] = useState(false);

  const submitDraft = async (reportId: string): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.submitDraft(reportId);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { submitDraft, loading };
}
