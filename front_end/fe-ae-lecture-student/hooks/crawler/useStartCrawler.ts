// hooks/crawler/useStartCrawler.ts
"use client";

import { useState, useCallback } from "react";
import { StartCrawlerPayload } from "@/types/crawler/crawler.payload";
import { StartCrawlerResponse } from "@/types/crawler/crawler.response";
import { CrawlerService } from "@/services/crawler.services";

export function useStartCrawler() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StartCrawlerResponse | null>(null);

  const start = useCallback(async (payload: StartCrawlerPayload) => {
    setLoading(true);
    try {
      const res = await CrawlerService.start(payload);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, start, reset };
}
