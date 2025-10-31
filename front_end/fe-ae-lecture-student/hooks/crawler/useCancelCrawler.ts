// hooks/crawler/useCancelCrawler.ts
"use client";

import { useState, useCallback } from "react";
import { CancelCrawlerResponse } from "@/types/crawler/crawler.response";
import { CrawlerService } from "@/services/crawler.services";

export function useCancelCrawler() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CancelCrawlerResponse | null>(null);

  const cancel = useCallback(async (jobId: string, userId?: string) => {
    setLoading(true);
    try {
      const res = await CrawlerService.cancel(jobId, userId);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, cancel, reset };
}
