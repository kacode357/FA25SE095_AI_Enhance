// hooks/smart-crawler/useSmartCrawlHistory.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlHistoryItem } from "@/types/smart-crawler/smart-crawler.response";
import type { SmartCrawlHistoryQuery } from "@/types/smart-crawler/smart-crawler.payload";

export function useSmartCrawlHistory() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlHistoryItem[] | null>(null);

  const fetchHistory = useCallback(async (params?: SmartCrawlHistoryQuery) => {
    setLoading(true);
    const res = await SmartCrawlerService.getHistory(params);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchHistory, reset };
}
