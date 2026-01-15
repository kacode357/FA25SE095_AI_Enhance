// services/smart-crawler.services.ts
import { crawlAxiosInstance } from "@/config/axios.config";
import type {
  SmartCrawlRequestPayload,
  SmartCrawlJobsQuery,
  SmartCrawlJobResultsQuery,
  SmartCrawlJobExportQuery,
} from "@/types/smart-crawler/smart-crawler.payload";
import type {
  SmartCrawlJobResponse,
  SmartCrawlJobSummary,
  SmartCrawlJobResultItem,
  SmartCrawlJobStats,
  SmartCrawlExportResponse,
} from "@/types/smart-crawler/smart-crawler.response";

const BASE = "/smart-crawler";

export const SmartCrawlerService = {
  /** POST /api/smart-crawler/crawl — Execute Pattern collection with prompt */
  crawl: async (payload: SmartCrawlRequestPayload): Promise<SmartCrawlJobResponse> => {
    const { data } = await crawlAxiosInstance.post<SmartCrawlJobResponse>(
      `${BASE}/crawl`,
      payload
    );
    return data;
  },

  /** GET /api/smart-crawler/job/{jobId} — Get job status & result summary */
  getJob: async (jobId: string): Promise<SmartCrawlJobResponse> => {
    const { data } = await crawlAxiosInstance.get<SmartCrawlJobResponse>(
      `${BASE}/job/${jobId}`
    );
    return data;
  },

  /** GET /api/smart-crawler/jobs?limit=50 — User's crawl jobs */
  getJobs: async (params?: SmartCrawlJobsQuery): Promise<SmartCrawlJobSummary[]> => {
    const { data } = await crawlAxiosInstance.get<SmartCrawlJobSummary[]>(`${BASE}/jobs`, {
      params: { limit: params?.limit },
    });
    return data;
  },

  /** GET /api/smart-crawler/job/{jobId}/results?page=1&pageSize=50 — Paginated results */
  getJobResults: async (
    jobId: string,
    params?: SmartCrawlJobResultsQuery
  ): Promise<SmartCrawlJobResultItem[]> => {
    console.log("[SmartCrawlerService] getJobResults - jobId:", jobId, "params:", params);
    const { data } = await crawlAxiosInstance.get<SmartCrawlJobResultItem[]>(
      `${BASE}/job/${jobId}/results`,
      {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
        },
      }
    );
    console.log("[SmartCrawlerService] getJobResults response - count:", data?.length || 0);
    return data;
  },

  /** GET /api/smart-crawler/job/{jobId}/stats — Realtime stats */
  getJobStats: async (jobId: string): Promise<SmartCrawlJobStats> => {
    const { data } = await crawlAxiosInstance.get<SmartCrawlJobStats>(
      `${BASE}/job/${jobId}/stats`
    );
    return data;
  },

  /** GET /api/smart-crawler/job/{jobId}/export?format=json — Export results */
  exportJob: async (
    jobId: string,
    params?: SmartCrawlJobExportQuery
  ): Promise<SmartCrawlExportResponse> => {
    const { data } = await crawlAxiosInstance.get<SmartCrawlExportResponse>(
      `${BASE}/job/${jobId}/export`,
      {
        params: { format: params?.format ?? "json" },
        responseType: "text",
      }
    );
    return data;
  },
};
