// hooks/smart-crawler/useSmartCrawlerJob.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobResponse } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerJob() {
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<SmartCrawlJobResponse | null>(null);

  const fetchJob = async (jobId: string): Promise<SmartCrawlJobResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SmartCrawlerService.getJob(jobId);
      setJob(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchJob,
    loading,
    job,
  };
}
