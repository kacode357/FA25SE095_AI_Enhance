// hooks/smart-crawler/useSmartCrawlerJobStats.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobStats } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerJobStats() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SmartCrawlJobStats | null>(null);

  const fetchJobStats = async (jobId: string): Promise<SmartCrawlJobStats | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SmartCrawlerService.getJobStats(jobId);
      setStats(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchJobStats,
    loading,
    stats,
  };
}
