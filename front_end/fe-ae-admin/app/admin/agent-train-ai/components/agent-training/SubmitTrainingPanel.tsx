"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  CrawlJob,
  CrawlResult,
  FeedbackResponse,
  QueuedJobResponse,
} from "@/types/agent-training/training.types";

import { CrawlLogConsole } from "./CrawlLogConsole";

interface SubmitTrainingPanelProps {
  submitCrawl: (
    job: CrawlJob
  ) => Promise<CrawlResult | QueuedJobResponse>;
  submitFeedback: (
    jobId: string,
    feedback: string
  ) => Promise<FeedbackResponse>;
  onNotify?: (message: string) => void;
  onSwitchToBuffer?: () => void;
}

export const SubmitTrainingPanel: React.FC<SubmitTrainingPanelProps> = ({
  submitCrawl,
  submitFeedback,
  onNotify,
  onSwitchToBuffer,
}) => {
  // Form inputs
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [requiredFields, setRequiredFields] = useState(""); // Optional: comma-separated
  const [maxPages, setMaxPages] = useState<number | null>(null); // null = không giới hạn
  const [urlError, setUrlError] = useState("");
  // Kết quả crawl và dialog
  const [currentResult, setCurrentResult] = useState<CrawlResult | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  // Kiểm tra URL hợp lệ (phải có http/https)
  const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return false;
    try {
      const parsedUrl = new URL(urlString);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl.trim() && !isValidUrl(newUrl)) {
      setUrlError("Please enter a valid HTTP or HTTPS URL");
    } else {
      setUrlError("");
    }
  };

  const isFormValid = isValidUrl(url) && description.trim();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Kiểm tra các field bắt buộc
    if (!isFormValid) {
      if (!url.trim()) {
        alert("Please enter a URL");
      } else if (!isValidUrl(url)) {
        alert("Please enter a valid HTTP or HTTPS URL");
      } else if (!description.trim()) {
        alert("Please provide a description of what to extract");
      }
      return;
    }

    // Build payload cho API
    const job: CrawlJob = {
      url,
      user_description: description,
    };

    // Thêm required fields nếu có (comma-separated)
    if (requiredFields.trim()) {
      job.extraction_schema = {
        required: requiredFields
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };
    }

    // Thêm max_pages nếu user chọn giới hạn
    // Note: Setting này sẽ ghi đè page limit trong prompt
    if (maxPages !== null) {
      job.max_pages = maxPages;
    }

    await handleCrawlSubmit(job);
  };

  const handleCrawlSubmit = async (job: CrawlJob) => {
    setCrawling(true);
    setCurrentResult(null);
    setCurrentJobId(null);
    setResultDialogOpen(false);

    try {
      const result = await submitCrawl(job);

      if ("status" in result && result.status === "queued") {
        // Job được xếp hàng chờ
        const queued = result as QueuedJobResponse;
        onNotify?.(queued.message);
        setUrl("");
        setDescription("");
        setRequiredFields("");
        setMaxPages(null);
      } else {
        // Crawl hoàn thành ngay - hiển kết quả
        const crawlResult = result as CrawlResult;
        setCurrentResult(crawlResult);
        setCurrentJobId(crawlResult.job_id);
        setResultDialogOpen(true);
        onNotify?.("Crawl completed! Please provide feedback.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      if (process.env.NODE_ENV === "development") {
        console.error("Crawl failed:", error);
      }
      onNotify?.(`Crawl failed: ${errorMessage}`);
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Submit Crawl Job
          </h2>
          <form
            onSubmit={handleFormSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="space-y-1">
              <label
                htmlFor="crawl-url"
                className="block text-sm font-medium text-slate-900"
              >
                Target URL <span className="text-red-500">*</span>
              </label>
              <input
                id="crawl-url"
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                required
                disabled={crawling}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              {urlError && (
                <p className="text-xs text-red-500" role="alert">
                  {urlError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="crawl-description"
                className="block text-sm font-medium text-slate-900"
              >
                What to Extract (Natural Language){" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="crawl-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Extract product names, prices, and descriptions from the product listing page..."
                required
                disabled={crawling}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              <p className="text-xs text-slate-500">
                Describe in natural language what data you want to extract.
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="required-fields"
                className="block text-sm font-medium text-slate-900"
              >
                Required Fields (Optional)
              </label>
              <input
                id="required-fields"
                type="text"
                value={requiredFields}
                onChange={(e) => setRequiredFields(e.target.value)}
                placeholder="name, price, description"
                disabled={crawling}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              <p className="text-xs text-slate-500">Comma-separated field names.</p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="max-pages"
                className="block text-sm font-medium text-slate-900"
              >
                Max Pages
              </label>
              <select
                id="max-pages"
                value={maxPages ?? ""}
                onChange={(e) => setMaxPages(e.target.value === "" ? null : Number(e.target.value))}
                disabled={crawling}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">No specified</option>
                <option value={1}>Up to 1 page</option>
                <option value={2}>Up to 2 pages</option>
                <option value={3}>Up to 3 pages</option>
                <option value={4}>Up to 4 pages</option>
                <option value={5}>Up to 5 pages</option>
              </select>
              <p className="text-xs text-amber-600">
                If selected, this overrides any page count in your prompt. Maximum 5 pages - exceeding this may cause inaccuracy.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || crawling}
              className="w-full"
            >
              {crawling ? "Crawling..." : "Start Crawl"}
            </Button>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Live Crawl Logs
            </h2>
          </div>
          <CrawlLogConsole jobId={currentJobId} isActive={crawling} />
        </section>
      </div>

      {/* Result Dialog */}
      {resultDialogOpen && currentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Crawl Results
              </h3>
              <button
                onClick={() => setResultDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Job ID:</span>
                    <span className="ml-2 text-slate-900">{currentResult.job_id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Status:</span>
                    <span className={`ml-2 font-semibold ${currentResult.success ? "text-green-600" : "text-red-600"}`}>
                      {currentResult.success ? "Success" : "Failed"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Pages Collected:</span>
                    <span className="ml-2 text-slate-900">{currentResult.metadata.pages_collected}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Execution Time:</span>
                    <span className="ml-2 text-slate-900">{currentResult.metadata.execution_time_ms}ms</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Domain:</span>
                    <span className="ml-2 text-slate-900">{currentResult.metadata.domain}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Base Reward:</span>
                    <span className="ml-2 text-slate-900">{currentResult.base_reward}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">
                  Extracted Data ({currentResult.data.length} items)
                </h4>
                <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white">
                  <pre className="p-4 text-xs text-slate-700">
                    {JSON.stringify(currentResult.data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setResultDialogOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {onSwitchToBuffer && (
                  <button
                    onClick={() => {
                      setResultDialogOpen(false);
                      onSwitchToBuffer();
                    }}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    View Pattern Buffers
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitTrainingPanel;
