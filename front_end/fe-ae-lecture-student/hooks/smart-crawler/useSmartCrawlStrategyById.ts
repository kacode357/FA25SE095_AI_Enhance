// hooks/smart-crawler/useSmartCrawlStrategyById.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlStrategyDetail } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlStrategyById() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlStrategyDetail | null>(null);

  const fetchStrategy = useCallback(async (strategyId: string) => {
    setLoading(true);
    const res = await SmartCrawlerService.getStrategyById(strategyId);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchStrategy, reset };
}
