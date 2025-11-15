// hooks/smart-crawler/useSmartCrawlerJobResults.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobResultsQuery } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerJobResults() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SmartCrawlJobResultItem[]>([]);

  const fetchJobResults = async (
    jobId: string,
    args?: SmartCrawlJobResultsQuery
  ): Promise<SmartCrawlJobResultItem[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SmartCrawlerService.getJobResults(jobId, args);
      setResults(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchJobResults,
    loading,
    results,
  };
}
