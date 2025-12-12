// types/smart-crawler/smart-crawler.response.ts

/** Common job response shape (start / get by id) */
export interface SmartCrawlJobResponse {
  jobId: string;
  success: boolean;
  resultCount: number;
  executionTimeMs: number;
  errorMessage?: string | null;
  failedStep?: number | null
  pageSnapshot?: string | null;
  conversationName : string | null;
}

/** Job list item (summary) — GET /jobs */
export interface SmartCrawlJobSummary {
  id: string;
  status: string;
  crawlerType: string;
  userPrompt: string;
  resultCount: number;
  createdAt: string; // ISO
  completedAt: string | null; // ISO
  errorMessage: string | null;
}

/** Paginated job result item — GET /job/{jobId}/results */
export interface SmartCrawlJobResultItem {
  id: string;
  url: string;
  extractedData: Record<string, any>;
  title: string | null;
  httpStatusCode: number;
  crawledAt: string; // ISO
  responseTimeMs: number;
  extractionConfidence: number;
  errorMessage: string | null;
  contentSize: number;
  promptUsed: string | null;
}

/** Realtime stats — GET /job/{jobId}/stats */
export interface SmartCrawlJobStats {
  jobId: string;
  status: string;
  totalUrls: number;
  completedUrls: number;
  failedUrls: number;
  progressPercentage: number;
  avgResponseTimeMs: number;
  totalContentSize: number;
  startedAt: string; // ISO
  estimatedCompletion: string | null; // ISO

  /**
   * BE hiện đang trả về đôi khi là string ("00:18:19.2838000"),
   * schema lại là object TimeSpan => union cho chắc ăn.
   */
  elapsedTime:
    | string
    | {
        ticks: number;
        days: number;
        hours: number;
        milliseconds: number;
        microseconds: number;
        nanoseconds: number;
        minutes: number;
        seconds: number;
        totalDays: number;
        totalHours: number;
        totalMilliseconds: number;
        totalMicroseconds: number;
        totalNanoseconds: number;
        totalMinutes: number;
        totalSeconds: number;
      };

  currentUrl: string | null;
  successRate: number;
}

/** Export response: API returns text/plain (string) */
export type SmartCrawlExportResponse = string;
