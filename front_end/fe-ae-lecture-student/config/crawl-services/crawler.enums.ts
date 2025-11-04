

export enum CrawlerType {
  HttpClient = 0,
  Selenium = 1,
  Playwright = 2,
  Scrapy = 3,
  Universal = 4,
  AppSpecificApi = 5,
  MobileMcp = 6,
  Crawl4AI = 7,
}

export enum Priority {
  Low = 0,
  Normal = 1,
  High = 2,
  Critical = 3,
}

export enum JobStatus {
  Pending = 0,
  Queued = 1,
  Assigned = 2,
  InProgress = 3,
  Running = 4,
  Completed = 5,
  Failed = 6,
  Cancelled = 7,
  Paused = 8,
}
