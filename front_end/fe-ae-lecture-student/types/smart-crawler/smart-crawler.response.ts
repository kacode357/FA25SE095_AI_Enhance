// types/smart-crawler/smart-crawler.response.ts

/** Common job response shape (start / get by id) */
export interface SmartCrawlJobResponse {
  jobId: string;
  success: boolean;
  resultCount: number;
  executionTimeMs: number;
  errorMessage?: string | null;
  failedStep?: number | null;
  /** Optional HTML/text snapshot (string) */
  pageSnapshot?: string | null;
}

/** History item */
export interface SmartCrawlHistoryItem {
  id: string;
  promptText: string;
  type: string;
  processedAt: string; // ISO
  crawlJobId: string;
  processingTimeMs: number;
  success: boolean;
}

/** Strategy list item */
export interface SmartCrawlStrategyItem {
  id: string;
  name: string;
  domain: string;
  type: string;
  timesUsed: number;
  successRate: number;
  isTemplate: boolean;
  createdAt: string; // ISO
}

/** Strategy detail */
export interface SmartCrawlStrategyDetail extends SmartCrawlStrategyItem {
  urlPattern: string;
  navigationStepsJson: string; // raw JSON string
  successCount: number;
  failureCount: number;
  averageExecutionTimeMs: number;
  isActive: boolean;
  updatedAt: string; // ISO
}

/** Job list item (summary) */
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

/** Paginated job result item */
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

/** Realtime stats */
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
  elapsedTime: {
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
