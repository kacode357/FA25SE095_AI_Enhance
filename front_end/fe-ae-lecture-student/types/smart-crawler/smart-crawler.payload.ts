// types/smart-crawler/smart-crawler.payload.ts

/** Body cho POST /api/smart-crawler/crawl */
export interface SmartCrawlRequestPayload {
  /** Natural language instruction to drive the crawl */
  prompt: string;
  /** Seed URL to start from */
  url: string;

  /** Id user hiện tại (guid) */
  userId?: string;
  /** Optional: assignment liên quan */
  assignmentId?: string;
  /** Optional: group trong course */
  groupId?: string;
  /** Optional: thread hội thoại đang dùng */
  conversationThreadId?: string;
}

export type SmartCrawlExportFormat = "json" | "csv";

/** Query params */
export interface SmartCrawlJobsQuery {
  /** default 50 */
  limit?: number;
}

export interface SmartCrawlJobResultsQuery {
  /** default 1 */
  page?: number;
  /** default 50 */
  pageSize?: number;
}

export interface SmartCrawlJobExportQuery {
  /** default "json" */
  format?: SmartCrawlExportFormat;
}
