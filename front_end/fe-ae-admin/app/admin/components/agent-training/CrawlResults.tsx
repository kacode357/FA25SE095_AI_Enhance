"use client";

import React, { useMemo } from "react";
import type { CrawlResult } from "@/types/agent-training/training.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CrawlResultsProps {
  result: CrawlResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IMAGE_REGEX = /\.(png|jpe?g|gif|webp|svg|bmp|tiff)(\?.*)?$/i;

const isImageValue = (value: string, key: string) => {
  const normalized = value.trim().toLowerCase();
  const keywordMatch = /image|photo|thumbnail|avatar|logo/.test(key);
  return (
    normalized.startsWith("http") &&
    (IMAGE_REGEX.test(normalized) || keywordMatch)
  );
};

const toTitle = (text: string) =>
  text
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((entry) => formatPrimitive(entry))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${formatPrimitive(v)}`)
      .join(", ");
  }

  return "";
};

const renderCellContent = (value: unknown, key: string) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">-</span>;
  }

  if (typeof value === "string" && isImageValue(value, key)) {
    return (
      <img
        src={value}
        alt={key}
        className="max-h-28 w-auto rounded-lg border border-slate-100 object-cover"
        loading="lazy"
      />
    );
  }

  if (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === "string" && isImageValue(entry, key))
  ) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((src, idx) => (
          <img
            key={`${key}-${idx}`}
            src={src}
            alt={`${key}-${idx}`}
            className="max-h-24 rounded-md border border-slate-100 object-cover"
            loading="lazy"
          />
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((entry, idx) => (
          <span
            key={`${key}-${idx}`}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
          >
            {formatPrimitive(entry)}
          </span>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-slate-700">{formatPrimitive(value)}</span>;
};

const formatDuration = (ms: number) => {
  if (!Number.isFinite(ms)) return "N/A";
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

export const CrawlResults: React.FC<CrawlResultsProps> = ({
  result,
  open,
  onOpenChange,
}) => {
  const dataRows = Array.isArray(result?.data) ? result.data : [];

  const columns = useMemo(() => {
    if (!dataRows || dataRows.length === 0) return [];
    const set = new Set<string>();
    dataRows.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row as Record<string, unknown>).forEach((k) => set.add(k));
      }
    });
    return Array.from(set);
  }, [dataRows]);

  const rewardPct = result ? Math.round(result.base_reward * 100) : 0;

  const qualityText =
    result && result.base_reward < 0.5
      ? "Needs significant improvement"
      : result && result.base_reward < 0.8
      ? "Decent, can refine"
      : "Great performance";

  return (
    <Dialog open={!!result && open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full
          !max-w-[calc(100vw-1.5rem)]
          sm:!max-w-[min(1200px,calc(100vw-2rem))]
          max-h-[85dvh]
          sm:max-h-[90dvh]
          overflow-hidden
          p-0
        "
      >
        {!result ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Submit a crawl job to view results here.
          </div>
        ) : (
          <div className="flex h-full max-h-[inherit] flex-col">
            {/* Top (no scroll) */}
            <div className="shrink-0 border-b border-slate-100 bg-white p-6">
              <DialogHeader>
                <DialogTitle>Crawl Results</DialogTitle>
              </DialogHeader>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-500">Domain: </span>
                    {result.metadata.domain}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Pages Crawled: </span>
                    {result.metadata.pages_collected}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Execution Time: </span>
                    {formatDuration(result.metadata.execution_time_ms)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Quality Score: </span>
                    {rewardPct}%
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span>{qualityText}</span>
                    <span>{rewardPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        result.success ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(Math.max(rewardPct, 0), 100)}%` }}
                    />
                  </div>

                  {result.error && (
                    <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                      <span className="font-semibold">Error:</span> {result.error}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <h4 className="text-sm font-semibold text-slate-900">
                  Structured Data ({dataRows.length} items)
                </h4>
                <span>Total columns: {columns.length}</span>
              </div>
            </div>

            {/* Body: ONLY this area scrolls */}
            <div className="min-h-0 flex-1 bg-slate-50/40 p-6">
              {dataRows.length > 0 && columns.length > 0 ? (
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white">
                  {/* SINGLE scroll container for table */}
                  <div className="relative min-h-0 flex-1 overflow-auto">
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <th
                              key={column}
                              className="
                                sticky top-0 z-30
                                bg-white
                                px-4 py-3
                                text-left text-xs font-medium text-slate-700
                                border-b border-slate-200
                                whitespace-nowrap
                              "
                            >
                              {toTitle(column)}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {dataRows.map((row, idx) => (
                          <tr key={`row-${idx}`} className="border-b last:border-b-0">
                            {columns.map((column) => (
                              <td
                                key={`${idx}-${column}`}
                                className="px-4 py-3 align-top text-xs text-slate-700"
                              >
                                {row && typeof row === "object"
                                  ? renderCellContent(
                                      (row as Record<string, unknown>)[column],
                                      column
                                    )
                                  : renderCellContent(row, column)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-600">
                  {result.success
                    ? "The crawl completed but no structured rows were returned."
                    : "The crawl failed before any structured data was produced."}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CrawlResults;
