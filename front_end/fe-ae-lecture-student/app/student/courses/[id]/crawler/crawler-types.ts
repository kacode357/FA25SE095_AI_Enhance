// app/.../crawler/crawler-types.ts
import type { MessageType } from "@/hooks/hubcrawlerchat/useCrawlerChatHub";

export type CrawlSummary = {
  summaryText?: string;
  insightHighlights?: string[];
  fieldCoverage?: { fieldName: string; coveragePercent: number }[];
  chartPreviews?: { title: string; chartType: string }[];
};

export type UiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  messageType?: MessageType;
  crawlJobId?: string | null;
  visualizationData?: string | null; 
  extractedData?: string | null;
};

export type JobHistoryEntry = {
  messageId: string;
  jobId: string;
  timestamp?: string;
  prompt?: string;
  summary?: string | null;
};
