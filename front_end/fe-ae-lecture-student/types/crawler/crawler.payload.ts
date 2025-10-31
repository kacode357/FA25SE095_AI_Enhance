// types/crawler/crawler.payload.ts
import { CrawlerType, Priority } from "@/config/crawl-services/crawler.enums";

export interface StartCrawlerPayload {
  userId: string;            // uuid
  urls: string[];
  crawlerType: CrawlerType;  // enum -> number
  priority: Priority;        // enum -> number
  assignmentId?: string;     // uuid
  configuration?: {
    timeoutSeconds?: number;
    followRedirects?: boolean;
    extractImages?: boolean;
    extractLinks?: boolean;
    customConfigJson?: string; // raw json string (server expects string)
  };
  userTier?: number;         // (0..n) tùy BE
}
