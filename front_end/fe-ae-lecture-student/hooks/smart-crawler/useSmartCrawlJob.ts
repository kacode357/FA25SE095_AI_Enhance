// hooks/smart-crawler/useSmartCrawlJob.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobResponse } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlJob() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlJobResponse | null>(null);

  const fetchJob = useCallback(async (jobId: string) => {
    setLoading(true);
    const res = await SmartCrawlerService.getJob(jobId);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchJob, reset };
}
