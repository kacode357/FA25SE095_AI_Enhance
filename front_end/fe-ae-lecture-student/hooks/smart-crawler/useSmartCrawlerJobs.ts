// hooks/smart-crawler/useSmartCrawlerJobs.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobsQuery } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlJobSummary } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerJobs() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<SmartCrawlJobSummary[]>([]);

  const fetchJobs = async (
    args?: SmartCrawlJobsQuery
  ): Promise<SmartCrawlJobSummary[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SmartCrawlerService.getJobs(args);
      setJobs(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchJobs,
    loading,
    jobs,
  };
}
