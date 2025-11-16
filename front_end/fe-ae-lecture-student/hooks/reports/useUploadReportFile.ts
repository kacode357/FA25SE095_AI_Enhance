// hooks/reports/useUploadReportFile.ts
"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { UploadReportFileResponse } from "@/types/reports/reports.response";

export function useUploadReportFile() {
  const [loading, setLoading] = useState(false);

  const uploadFile = async (
    reportId: string,
    file: File
  ): Promise<UploadReportFileResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.uploadFile(reportId, file);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading };
}
