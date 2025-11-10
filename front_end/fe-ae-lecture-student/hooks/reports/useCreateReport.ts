"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { CreateReportPayload } from "@/types/reports/reports.payload";
import type { CreateReportResponse } from "@/types/reports/reports.response";

export function useCreateReport() {
  const [loading, setLoading] = useState(false);

  const createReport = async (
    payload: CreateReportPayload
  ): Promise<CreateReportResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.create(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { createReport, loading };
}
