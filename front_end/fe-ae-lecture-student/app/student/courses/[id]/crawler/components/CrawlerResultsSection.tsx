// app/student/courses/[id]/crawler/components/CrawlerResultsSection.tsx
"use client";

import {
  ClipboardList,
  AlertCircle,
  Database,
  Link as LinkIcon,
  BrainCircuit,
  BarChart3,
  ListChecks,
} from "lucide-react";
import type { CrawlSummary } from "../crawler-types";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";
import { useMemo } from "react";

/** Helper: Format key từ "product_name" -> "Product Name" */
function formatHeader(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/** Helper: Format value hiển thị trong cell */
function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-slate-300 italic">-</span>;
  }
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 3).map((item, i) => (
          <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
            {String(item)}
          </span>
        ))}
        {value.length > 3 && <span className="text-[10px] text-slate-400">+{value.length - 3}</span>}
      </div>
    );
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  // Check nếu là URL ảnh (đuôi jpg, png...)
  const strVal = String(value);
  if (strVal.match(/\.(jpeg|jpg|gif|png|webp)$/i) && strVal.startsWith("http")) {
    return (
      <a href={strVal} target="_blank" rel="noreferrer" className="text-[var(--brand)] underline hover:text-blue-600">
        [Image]
      </a>
    );
  }
  
  return <span className="line-clamp-2" title={strVal}>{strVal}</span>;
}

type Props = {
  results: SmartCrawlJobResultItem[];
  resultsLoading: boolean;
  summary: CrawlSummary | null;
  summaryError: string | null;
  summaryLoading: boolean;
  activeJobId?: string | null;
};

export default function CrawlerResultsSection({
  results,
  resultsLoading,
  summary,
  summaryError,
  summaryLoading,
  activeJobId,
}: Props) {
  const showEmpty = results.length === 0 && !resultsLoading;

  // 1. Lấy danh sách tất cả các keys duy nhất từ extractedData của tất cả results
  const dynamicColumns = useMemo(() => {
    const keys = new Set<string>();
    results.forEach((item) => {
      if (item.extractedData) {
        Object.keys(item.extractedData).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [results]);

  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2">
        <ClipboardList className="h-4 w-4 text-[var(--brand)]" />
        Crawled Data & Analysis
      </div>

      {/* Results Table / Empty State */}
      {showEmpty ? (
        <div className="flex h-[240px] flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl bg-slate-50/50">
          <div className="mb-3 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <Database className="h-5 w-5 text-slate-400" />
          </div>
          <p>No results yet. Start a crawl job to see data here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden flex flex-col">
          {/* Scroll container cho bảng nếu quá nhiều cột */}
          <div className="overflow-auto max-h-[450px] scrollbar-thin scrollbar-thumb-slate-200">
            <table className="min-w-full border-collapse text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-[var(--text-muted)] sticky top-0 z-10 shadow-sm">
                <tr>
                  {/* Cột cố định: STT */}
                  <th className="border-b border-[var(--border)] px-3 py-2.5 text-left w-[40px] font-medium bg-slate-50">
                    #
                  </th>
                  
                  {/* Cột cố định: Source URL */}
                  <th className="border-b border-[var(--border)] px-3 py-2.5 text-left font-medium min-w-[150px] bg-slate-50">
                    Source URL
                  </th>

                  {/* Cột động từ extractedData */}
                  {dynamicColumns.map((col) => (
                    <th
                      key={col}
                      className="border-b border-[var(--border)] px-3 py-2.5 text-left font-medium min-w-[120px] bg-slate-50 capitalize"
                    >
                      {formatHeader(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {results.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    {/* STT */}
                    <td className="px-3 py-2.5 text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    {/* Source URL */}
                    <td className="px-3 py-2.5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[var(--brand)] hover:underline max-w-[200px]"
                        title={item.url}
                      >
                        <LinkIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.url}</span>
                      </a>
                    </td>

                    {/* Dữ liệu động */}
                    {dynamicColumns.map((col) => {
                      // Lấy giá trị, xử lý trường hợp extractedData null
                      const rawValue = item.extractedData ? item.extractedData[col] : null;
                      return (
                        <td key={`${item.id}-${col}`} className="px-3 py-2.5 text-slate-700 max-w-[250px] truncate">
                          {formatCellValue(rawValue)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-[var(--border)] bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
            Showing {results.length} results • Found {dynamicColumns.length} data fields
          </div>
        </div>
      )}

      {/* AI Analysis Section (Giữ nguyên logic cũ) */}
      <div className="pt-2 border-t border-[var(--border)]">
        {summaryError && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-600 border border-rose-100">
            <AlertCircle className="h-4 w-4" />
            <span>{summaryError}</span>
          </div>
        )}

        {!summary && !summaryLoading && !summaryError && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] opacity-80 px-2">
            <BrainCircuit className="h-4 w-4" />
            <p>
              Summary will appear here when Agent returns{" "}
              <code className="bg-slate-100 px-1 rounded font-mono text-slate-600">
                AiSummary
              </code>
            </p>
          </div>
        )}

        {summaryLoading && (
          <div className="flex items-center gap-2 text-xs text-[var(--brand)] animate-pulse px-2">
            <BrainCircuit className="h-4 w-4" />
            <span>Analyzing crawled data...</span>
          </div>
        )}

        {summary && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-3 shadow-sm">
            {/* Summary Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                <BrainCircuit className="h-4 w-4 text-[var(--brand)]" />
                <span>AI Insights</span>
                {activeJobId && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-600 text-[10px] font-normal font-mono border border-indigo-200">
                    Job #{activeJobId.slice(0, 6)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-indigo-400">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Summary Text */}
            <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-line bg-white/60 p-2.5 rounded-lg border border-indigo-100/50">
              {summary.summaryText || "No summary text generated."}
            </p>

            {/* Key Highlights */}
            {summary.insightHighlights && summary.insightHighlights.length > 0 && (
              <div className="bg-white rounded-lg p-2.5 border border-indigo-100/50 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                  <ListChecks className="h-3.5 w-3.5 text-emerald-500" />
                  Key Takeaways
                </div>
                <ul className="space-y-1">
                  {summary.insightHighlights.map((h, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 pl-1">
                      <span className="text-indigo-400 mt-1.5 h-1 w-1 rounded-full bg-indigo-400 shrink-0" />
                      <span className="leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metrics Footer */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/60 p-2 rounded-lg border border-indigo-100/50">
                <span className="block font-medium text-slate-500 mb-1">
                  Data Coverage
                </span>
                <div className="text-slate-700">
                  {summary.fieldCoverage && summary.fieldCoverage.length > 0
                    ? summary.fieldCoverage
                        .slice(0, 3)
                        .map((f) => `${f.fieldName} (${f.coveragePercent}%)`)
                        .join(", ")
                    : "N/A"}
                </div>
              </div>
              
              <div className="bg-white/60 p-2 rounded-lg border border-indigo-100/50">
                <span className="block font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Suggested Charts
                </span>
                <div className="text-slate-700">
                  {summary.chartPreviews && summary.chartPreviews.length > 0
                    ? summary.chartPreviews
                        .slice(0, 2)
                        .map((c) => c.title)
                        .join(", ")
                    : "None"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}