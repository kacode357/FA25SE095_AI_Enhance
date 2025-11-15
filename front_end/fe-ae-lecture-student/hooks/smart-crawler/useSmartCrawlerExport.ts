// hooks/smart-crawler/useSmartCrawlerExport.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobExportQuery } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlExportResponse } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerExport() {
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<SmartCrawlExportResponse | null>(null);

  const exportJob = async (
    jobId: string,
    args?: SmartCrawlJobExportQuery
  ): Promise<SmartCrawlExportResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SmartCrawlerService.exportJob(jobId, args);
      setExportData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    exportJob,
    loading,
    exportData,
  };
}
