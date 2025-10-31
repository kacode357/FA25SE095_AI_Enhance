// hooks/crawler/useCrawlerStatus.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GetCrawlerStatusResponse } from "@/types/crawler/crawler.response";
import { JobStatus } from "@/config/crawl-services/crawler.enums";
import { CrawlerService } from "@/services/crawler.services";

export function useCrawlerStatus() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetCrawlerStatusResponse | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fetchOnce = useCallback(async (jobId: string, userId?: string) => {
    setLoading(true);
    try {
      const res = await CrawlerService.status(jobId, userId);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Poll chỉ gọi đúng API `/status`.
   * stopOnTerminal: dừng nếu status ∈ [Completed, Failed, Cancelled]
   */
  const poll = useCallback(
    (jobId: string, userId?: string, intervalMs = 1000, stopOnTerminal = true) => {
      clearPoll();
      timerRef.current = setInterval(async () => {
        const s = await CrawlerService.status(jobId, userId);
        setData(s);
        if (
          stopOnTerminal &&
          (s.status === JobStatus.Completed ||
            s.status === JobStatus.Failed ||
            s.status === JobStatus.Cancelled)
        ) {
          clearPoll();
        }
      }, intervalMs);
    },
    [clearPoll]
  );

  useEffect(() => () => clearPoll(), [clearPoll]);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetchOnce, poll, clearPoll, reset };
}
