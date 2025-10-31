// hooks/crawler/useListUserCrawlerJobs.ts
"use client";

import { useState, useCallback } from "react";
import { ListCrawlerJobsResponse } from "@/types/crawler/crawler.response";
import { JobStatus } from "@/config/crawl-services/crawler.enums";
import { CrawlerService } from "@/services/crawler.services";

type Args = {
  userId: string;
  status?: JobStatus;
  pageNumber?: number;
  pageSize?: number;
};

export function useListUserCrawlerJobs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ListCrawlerJobsResponse | null>(null);

  const fetch = useCallback(async (args: Args) => {
    setLoading(true);
    try {
      const res = await CrawlerService.listUserJobs(args);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { loading, data, fetch, reset };
}
