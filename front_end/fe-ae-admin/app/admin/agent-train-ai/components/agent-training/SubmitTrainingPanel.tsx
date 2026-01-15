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
}

export const SubmitTrainingPanel: React.FC<SubmitTrainingPanelProps> = ({
  submitCrawl,
  submitFeedback,
  onNotify,
}) => {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [requiredFields, setRequiredFields] = useState("");
  const [urlError, setUrlError] = useState("");
  const [currentResult, setCurrentResult] = useState<CrawlResult | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackRequired, setFeedbackRequired] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

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

    if (!isFormValid) {
      setUrlError("Please enter a valid HTTP or HTTPS URL");
      return;
    }

    const job: CrawlJob = {
      url,
      user_description: description,
    };

    if (requiredFields.trim()) {
      job.extraction_schema = {
        required: requiredFields
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };
    }

    await handleCrawlSubmit(job);
  };

  const handleCrawlSubmit = async (job: CrawlJob) => {
    setCrawling(true);
    setCurrentResult(null);
    setCurrentJobId(null);
    setFeedbackRequired(false);
    setResultDialogOpen(false);

    try {
      const result = await submitCrawl(job);

      if ("status" in result && result.status === "queued") {
        const queued = result as QueuedJobResponse;
        onNotify?.(queued.message);
        setUrl("");
        setDescription("");
        setRequiredFields("");
      } else {
        const crawlResult = result as CrawlResult;
        setCurrentResult(crawlResult);
        setCurrentJobId(crawlResult.job_id);
        setFeedbackRequired(true);
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

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!currentResult || submittingFeedback) return;

    setSubmittingFeedback(true);

    try {
      const response = await submitFeedback(currentResult.job_id, feedback);

      if (response.status === "clarification_needed") {
        onNotify?.(
          response.question
            ? `Feedback received. Clarification skipped: ${response.question}`
            : "Feedback received. Clarification skipped."
        );
      } else {
        onNotify?.("Feedback accepted! Agent is learning...");
      }
      setFeedbackRequired(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      if (process.env.NODE_ENV === "development") {
        console.error("Feedback submission failed:", error);
      }
      onNotify?.(`Feedback failed: ${errorMessage}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleResultsDialogChange = (open: boolean) => {
    if (!open) {
      setResultDialogOpen(false);
      return;
    }

    if (currentResult) {
      setResultDialogOpen(true);
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
    </div>
  );
};

export default SubmitTrainingPanel;
