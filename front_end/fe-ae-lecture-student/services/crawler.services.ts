// services/crawler.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import { StartCrawlerPayload } from "@/types/crawler/crawler.payload";
import {
  CancelCrawlerResponse,
  GetCrawlerStatusResponse,
  ListCrawlerJobsResponse,
  StartCrawlerResponse,
} from "@/types/crawler/crawler.response";

/**
 * NOTE:
 * - Dùng courseAxiosInstance vì base API cùng domain. Nếu BE tách service khác,
 *   đổi sang crawlerAxiosInstance ở đây là xong.
 */
export const CrawlerService = {
  /** POST /api/Crawler/start */
  start: async (payload: StartCrawlerPayload): Promise<StartCrawlerResponse> => {
    const res = await courseAxiosInstance.post<StartCrawlerResponse>("/Crawler/start", payload);
    return res.data;
  },

  /** GET /api/Crawler/{jobId}/status?userId=... */
  status: async (jobId: string, userId?: string): Promise<GetCrawlerStatusResponse> => {
    const res = await courseAxiosInstance.get<GetCrawlerStatusResponse>(`/Crawler/${jobId}/status`, {
      params: userId ? { userId } : undefined,
    });
    return res.data;
  },

  /** POST /api/Crawler/{jobId}/cancel?userId=... */
  cancel: async (jobId: string, userId?: string): Promise<CancelCrawlerResponse> => {
    const res = await courseAxiosInstance.post<CancelCrawlerResponse>(`/Crawler/${jobId}/cancel`, null, {
      params: userId ? { userId } : undefined,
    });
    return res.data;
  },

  /** GET /api/Crawler/user/{userId}/jobs?status=&pageNumber=&pageSize= */
  listUserJobs: async (args: {
    userId: string;
    status?: number;         // JobStatus as number
    pageNumber?: number;     // default 1
    pageSize?: number;       // default 10
  }): Promise<ListCrawlerJobsResponse> => {
    const { userId, status, pageNumber = 1, pageSize = 10 } = args;
    const res = await courseAxiosInstance.get<ListCrawlerJobsResponse>(`/Crawler/user/${userId}/jobs`, {
      params: { status, pageNumber, pageSize },
    });
    return res.data;
  },
};
