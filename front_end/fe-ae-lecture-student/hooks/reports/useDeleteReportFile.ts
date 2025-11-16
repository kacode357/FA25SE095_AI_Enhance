// hooks/reports/useDeleteReportFile.ts
"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { ApiSuccess } from "@/types/reports/reports.response";

export function useDeleteReportFile() {
  const [loading, setLoading] = useState(false);

  const deleteFile = async (reportId: string): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.deleteFile(reportId);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { deleteFile, loading };
}
