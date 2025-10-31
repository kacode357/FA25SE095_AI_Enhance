// hooks/smart-crawler/useSmartCrawlJobs.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobSummary } from "@/types/smart-crawler/smart-crawler.response";
import type { SmartCrawlJobsQuery } from "@/types/smart-crawler/smart-crawler.payload";

export function useSmartCrawlJobs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlJobSummary[] | null>(null);

  const fetchJobs = useCallback(async (params?: SmartCrawlJobsQuery) => {
    setLoading(true);
    const res = await SmartCrawlerService.getJobs(params);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchJobs, reset };
}
