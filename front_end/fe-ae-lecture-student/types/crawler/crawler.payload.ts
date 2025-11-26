import { CrawlerType, Priority } from "@/config/crawl-services/crawler.enums";

export interface StartCrawlerPayload {
  userId: string;
  urls: string[];
  crawlerType: CrawlerType;
  priority: Priority;
  assignmentId?: string;
  configuration?: {
    timeoutSeconds?: number;
    followRedirects?: boolean;
    extractImages?: boolean;
    extractLinks?: boolean;
    customConfigJson?: string;
  };
  userTier?: number;
}
