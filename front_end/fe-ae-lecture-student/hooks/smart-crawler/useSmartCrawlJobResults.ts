// hooks/smart-crawler/useSmartCrawlJobResults.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";
import type { SmartCrawlJobResultsQuery } from "@/types/smart-crawler/smart-crawler.payload";

export function useSmartCrawlJobResults() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlJobResultItem[] | null>(null);

  const fetchResults = useCallback(async (jobId: string, params?: SmartCrawlJobResultsQuery) => {
    setLoading(true);
    const res = await SmartCrawlerService.getJobResults(jobId, params);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchResults, reset };
}
