// hooks/smart-crawler/useSmartCrawl.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlRequestPayload } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlJobResponse } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawl() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlJobResponse | null>(null);

  const crawl = useCallback(async (payload: SmartCrawlRequestPayload) => {
    setLoading(true);
    const res = await SmartCrawlerService.crawl(payload);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, crawl, reset };
}
