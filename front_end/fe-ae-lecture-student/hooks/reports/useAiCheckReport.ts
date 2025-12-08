"use client";

import { ReportsService } from "@/services/reports.services";
import type { AiCheckPayload } from "@/types/reports/reports.payload";
import type { AiCheckResponse } from "@/types/reports/reports.response";
import { useState } from "react";

export function useAiCheckReport() {
  const [loading, setLoading] = useState(false);

  const aiCheckReport = async (
    payload: AiCheckPayload
  ): Promise<AiCheckResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.aiCheck(payload);
      return res;
    } catch (err: any) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { aiCheckReport, loading };
}
