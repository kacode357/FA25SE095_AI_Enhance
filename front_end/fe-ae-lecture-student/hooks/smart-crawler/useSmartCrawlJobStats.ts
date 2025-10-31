// hooks/smart-crawler/useSmartCrawlJobStats.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobStats } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlJobStats() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlJobStats | null>(null);

  const fetchStats = useCallback(async (jobId: string) => {
    setLoading(true);
    const res = await SmartCrawlerService.getJobStats(jobId);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchStats, reset };
}
