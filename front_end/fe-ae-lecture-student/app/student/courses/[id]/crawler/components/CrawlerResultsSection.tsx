"use client";

import { ChevronDown, ClipboardList, Database, Link as LinkIcon } from "lucide-react";
import { useMemo } from "react";

import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";
import type { JobHistoryEntry } from "../crawler-types";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

function formatHeader(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (/\.(jpe?g|png|gif|webp)$/i.test(url.pathname)) return url.toString();
  } catch {
    if (/\.(jpe?g|png|gif|webp)(\?.*)?(#.*)?$/i.test(trimmed)) return trimmed;
  }
  return null;
}

function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-slate-300 italic">-</span>;
  }
  if (typeof value === "boolean") return value ? "True" : "False";

  if (Array.isArray(value)) {
    const imageUrls = value
      .map((item) => (typeof item === "string" ? getImageUrl(item) : null))
      .filter((item): item is string => Boolean(item));

    if (imageUrls.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {imageUrls.slice(0, 3).map((url, idx) => (
            <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer">
              <img
                src={url}
                alt="preview"
                className="h-10 w-10 rounded border border-[var(--border)] object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </a>
          ))}
          {imageUrls.length > 3 && (
            <span className="text-[10px] text-slate-400">+{imageUrls.length - 3}</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 3).map((item, idx) => (
          <span
            key={idx}
            className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] border border-slate-200"
          >
            {String(item)}
          </span>
        ))}
        {value.length > 3 && (
          <span className="text-[10px] text-slate-400">+{value.length - 3}</span>
        )}
      </div>
    );
  }

  if (typeof value === "object") return JSON.stringify(value);

  const strVal = String(value);
  const imageUrl = getImageUrl(strVal);
  if (imageUrl) {
    return (
      <a href={imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center">
        <img
          src={imageUrl}
          alt="preview"
          className="h-14 w-14 rounded-md border border-[var(--border)] object-cover shadow-sm"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <span className="line-clamp-2" title={strVal}>
      {strVal}
    </span>
  );
}

type Props = {
  results: SmartCrawlJobResultItem[];
  resultsLoading: boolean;

  historyIndex?: number;
  currentSummary?: string;
  currentPrompt?: string;

  jobHistory?: JobHistoryEntry[];
  onSelectHistoryIndex?: (index: number) => void;
};

const truncateUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.length <= 60) return url;
  return `${url.slice(0, 40)}...${url.slice(-15)}`;
};

const extractUrlFromPrompt = (prompt?: string | null) => {
  if (!prompt) return null;
  const segments = prompt.split("|");
  const candidate = segments[segments.length - 1]?.trim();
  if (!candidate) return null;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.includes("://")) return candidate;
  return null;
};

export default function CrawlerResultsSection({
  results,
  resultsLoading,
  historyIndex = -1,
  currentSummary,
  currentPrompt,
  jobHistory = [],
  onSelectHistoryIndex,
}: Props) {
  const showEmpty = results.length === 0 && !resultsLoading;

  const showHistorySelect = jobHistory.length > 0;
  const selectValue =
    historyIndex >= 0 && historyIndex < jobHistory.length ? String(historyIndex) : "";

  const activeUrl =
    extractUrlFromPrompt(currentPrompt) ||
    (historyIndex >= 0 ? extractUrlFromPrompt(jobHistory[historyIndex]?.prompt) : null);

  const buildHistoryOptionLabel = (entry: JobHistoryEntry) => {
    const url = extractUrlFromPrompt(entry.prompt);
    const urlLabel = truncateUrl(url);

    const timeLabel = entry.timestamp
      ? formatDateTimeVN(entry.timestamp)
      : "";

    const fallback =
      entry.jobId && entry.jobId.length > 14
        ? `${entry.jobId.slice(0, 6)}...${entry.jobId.slice(-4)}`
        : entry.jobId || "Crawl";

    const linkPart = urlLabel || fallback;
    const parts = [timeLabel, linkPart].filter(Boolean);

    return parts.join(" | ");
  };

  const dynamicColumns = useMemo(() => {
    const keys = new Set<string>();
    results.forEach((item) => {
      if (item.extractedData) Object.keys(item.extractedData).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [results]);

  return (
    <div className="card p-3 space-y-2" data-prevent-tab-hide="true">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[var(--brand)]" />
          Crawled Data
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-600">
          {showHistorySelect && (
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wide text-slate-400">History</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 focus:border-[var(--brand)] focus:outline-none"
                value={selectValue}
                onChange={(event) => {
                  const idx = Number(event.target.value);
                  if (!Number.isNaN(idx)) onSelectHistoryIndex?.(idx);
                }}
                disabled={resultsLoading}
              >
                {jobHistory.map((entry, idx) => (
                  <option key={`${entry.jobId}-${idx}`} value={idx}>
                    {buildHistoryOptionLabel(entry)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {(currentSummary || activeUrl) && (
          <div className="space-y-2 rounded-xl border border-dashed border-[var(--border)] bg-slate-50/60 p-2 text-[10px] text-slate-700">
            {currentSummary && (
              <div>
                <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Crawl summary
                </div>
                <p className="leading-tight whitespace-pre-line line-clamp-2">{currentSummary}</p>
              </div>
            )}
            {activeUrl && (
              <div className="text-[9px]">
                <span className="font-semibold uppercase tracking-wide text-slate-400">
                  Source:
                </span>{" "}
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--brand)] underline"
                >
                  {truncateUrl(activeUrl)}
                </a>
              </div>
            )}
          </div>
        )}

          {showEmpty ? (
            <div className="flex h-[120px] flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl bg-slate-50/50">
              <div className="mb-2 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Database className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[10px]">No results yet. Start a crawl job.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden flex flex-col">
              <div
                className="overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain"
                data-prevent-tab-hide="true"
                onWheelCapture={(event) => event.stopPropagation()}
              >
                <table className="min-w-full border-collapse text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-[var(--text-muted)] sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="border-b border-[var(--border)] px-2 py-1.5 text-left w-[30px] font-medium bg-slate-50 text-[9px]">
                        #
                      </th>
                      <th className="border-b border-[var(--border)] px-2 py-1.5 text-left font-medium min-w-[130px] bg-slate-50 text-[9px]">
                        Source URL
                      </th>
                      {dynamicColumns.map((col) => (
                        <th
                          key={col}
                          className="border-b border-[var(--border)] px-2 py-1.5 text-left font-medium min-w-[100px] bg-slate-50 capitalize text-[9px]"
                        >
                          {formatHeader(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {results.map((item, idx) => (
                      <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-2 py-1.5 text-slate-400 font-mono text-[9px]">{idx + 1}</td>
                        <td className="px-2 py-1.5">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[var(--brand)] hover:underline max-w-[150px] text-[9px]"
                            title={item.url}
                          >
                            <LinkIcon className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{item.url}</span>
                          </a>
                        </td>
                        {dynamicColumns.map((col) => {
                          const rawValue = item.extractedData ? item.extractedData[col] : null;
                          return (
                            <td
                              key={`${item.id}-${col}`}
                              className="px-2 py-1.5 text-slate-700 max-w-[180px] truncate text-[9px]"
                            >
                              {formatCellValue(rawValue)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[var(--border)] bg-slate-50 px-2 py-1 text-[9px] text-slate-500">
                {results.length} result{results.length === 1 ? "" : "s"} | {dynamicColumns.length} field{dynamicColumns.length === 1 ? "" : "s"}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
