// hooks/smart-crawler/useSmartCrawlExportJob.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlExportResponse } from "@/types/smart-crawler/smart-crawler.response";
import type { SmartCrawlJobExportQuery } from "@/types/smart-crawler/smart-crawler.payload";

export function useSmartCrawlExportJob() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlExportResponse | null>(null);

  const exportJob = useCallback(async (jobId: string, params?: SmartCrawlJobExportQuery) => {
    setLoading(true);
    const res = await SmartCrawlerService.exportJob(jobId, params);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, exportJob, reset };
}
