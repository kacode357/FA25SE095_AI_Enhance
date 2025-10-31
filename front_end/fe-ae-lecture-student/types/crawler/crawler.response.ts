// types/crawler/crawler.response.ts
import { CrawlerType, JobStatus, Priority } from "@/config/crawl-services/crawler.enums";

export interface StartCrawlerResponse {
  jobId: string;      // uuid
  status: JobStatus;  // number enum
  createdAt: string;  // ISO
  message: string;
}

export interface CrawlerAgentInfo {
  id: string;
  name: string;
  type: number;
  status: number;
}

export interface CrawlerResultItem {
  id: string;
  url: string;
  isSuccess: boolean;
  statusCode: number;
  contentType: string | null;
  contentSize: number;
  title: string | null;
  description: string | null;
  errorMessage: string | null;
  crawledAt: string;      // ISO
  images: string[];
  links: string[];
}

export interface GetCrawlerStatusResponse {
  id: string;                 // jobId
  userId: string;
  assignmentId: string | null;
  urls: string[];
  status: JobStatus;
  priority: Priority;
  crawlerType: CrawlerType;
  createdAt: string;          // ISO
  startedAt: string | null;   // ISO|nullable
  completedAt: string | null; // ISO|nullable
  failedAt: string | null;    // ISO|nullable
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  urlsProcessed: number;
  urlsSuccessful: number;
  urlsFailed: number;
  totalContentSize: number;
  timeoutSeconds: number;
  followRedirects: boolean;
  extractImages: boolean;
  extractLinks: boolean;
  configurationJson: string | null;
  assignedAgent: CrawlerAgentInfo | null;
  results: CrawlerResultItem[];
}

export interface CancelCrawlerResponse {
  jobId: string;
  success: boolean;
  message: string;
}

export interface ListCrawlerJobsItem {
  id: string;
  assignmentId: string | null;
  urlCount: number;
  status: JobStatus;
  priority: Priority;
  crawlerType: CrawlerType;
  createdAt: string;          // ISO
  completedAt: string | null; // ISO
  urlsProcessed: number;
  urlsSuccessful: number;
  urlsFailed: number;
  totalContentSize: number;
  errorMessage: string | null;
}

export interface ListCrawlerJobsResponse {
  data: ListCrawlerJobsItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
