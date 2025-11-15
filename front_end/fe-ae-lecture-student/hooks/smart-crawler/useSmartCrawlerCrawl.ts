// hooks/smart-crawler/useSmartCrawlerCrawl.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlRequestPayload } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlJobResponse } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerCrawl() {
  const [loading, setLoading] = useState(false);
  const [lastJob, setLastJob] = useState<SmartCrawlJobResponse | null>(null);

  const startCrawl = async (
    payload: SmartCrawlRequestPayload
  ): Promise<SmartCrawlJobResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await SmartCrawlerService.crawl(payload);
      setLastJob(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    startCrawl,
    loading,
    lastJob,
  };
}
