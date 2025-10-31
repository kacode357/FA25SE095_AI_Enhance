// types/smart-crawler/smart-crawler.payload.ts

export interface SmartCrawlRequestPayload {
  /** Natural language instruction to drive the crawl */
  prompt: string;
  /** Seed URL to start from */
  url: string;
}

export type SmartCrawlExportFormat = "json" | "csv";

/** Query params */
export interface SmartCrawlHistoryQuery {
  /** default 50 */
  limit?: number;
}

export interface SmartCrawlStrategiesQuery {
  /** e.g. "example.com" */
  domain?: string;
}

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
