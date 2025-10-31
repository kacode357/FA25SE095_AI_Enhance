// hooks/smart-crawler/useSmartCrawlStrategies.ts
"use client";

import { useState, useCallback } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlStrategyItem } from "@/types/smart-crawler/smart-crawler.response";
import type { SmartCrawlStrategiesQuery } from "@/types/smart-crawler/smart-crawler.payload";

export function useSmartCrawlStrategies() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartCrawlStrategyItem[] | null>(null);

  const fetchStrategies = useCallback(async (params?: SmartCrawlStrategiesQuery) => {
    setLoading(true);
    const res = await SmartCrawlerService.getStrategies(params);
    setData(res);
    setLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchStrategies, reset };
}
