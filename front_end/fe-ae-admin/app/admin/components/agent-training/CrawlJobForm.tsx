"use client";

import React, { useState } from "react";
import type { CrawlJob } from "@/types/agent-training/training.types";

interface CrawlJobFormProps {
  onSubmit: (job: CrawlJob) => void;
  disabled?: boolean;
  previousFeedback?: string;
}

export const CrawlJobForm: React.FC<CrawlJobFormProps> = ({
  onSubmit,
  disabled = false,
  previousFeedback,
}) => {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [requiredFields, setRequiredFields] = useState("");
  const [urlError, setUrlError] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUrl(url)) {
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

    if (previousFeedback) {
      job.feedback_from_previous = previousFeedback;
    }

    onSubmit(job);
  };

  const isValid = isValidUrl(url) && description.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <label
          htmlFor="url"
          className="block text-sm font-medium text-slate-900"
        >
          Target URL <span className="text-red-500">*</span>
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com"
          required
          disabled={disabled}
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
          htmlFor="description"
          className="block text-sm font-medium text-slate-900"
        >
          What to Extract (Natural Language){" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Extract product names, prices, and descriptions from the product listing page..."
          required
          disabled={disabled}
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
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
        <p className="text-xs text-slate-500">Comma-separated field names.</p>
      </div>

      {previousFeedback && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          <strong className="block font-medium">
            Re-crawling with previous feedback:
          </strong>
          <p className="mt-1">{previousFeedback}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || disabled}
        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? "Crawling..." : "Start Training Crawl"}
      </button>
    </form>
  );
};
