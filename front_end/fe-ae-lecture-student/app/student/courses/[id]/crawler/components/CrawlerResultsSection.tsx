// app/student/courses/[id]/crawler/components/CrawlerResultsSection.tsx
"use client";

import { ClipboardList, Database, Link as LinkIcon } from "lucide-react";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";
import { useMemo } from "react";

/** Helper: Format key kiểu "product_name" -> "Product Name" */
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
          <span
            key={i}
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
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  // Check nếu là URL ảnh (đuôi jpg, png...)
  const strVal = String(value);
  if (strVal.match(/\.(jpeg|jpg|gif|png|webp)$/i) && strVal.startsWith("http")) {
    return (
      <a
        href={strVal}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center"
      >
        <img
          src={strVal}
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
};

export default function CrawlerResultsSection({ results, resultsLoading }: Props) {
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
        Crawled Data
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
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    {/* STT */}
                    <td className="px-3 py-2.5 text-slate-400 font-mono">{idx + 1}</td>

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

                    {/* Dữ liệu từng cột */}
                    {dynamicColumns.map((col) => {
                      const rawValue = item.extractedData ? item.extractedData[col] : null;
                      return (
                        <td
                          key={`${item.id}-${col}`}
                          className="px-3 py-2.5 text-slate-700 max-w-[250px] truncate"
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

          <div className="border-t border-[var(--border)] bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
            Showing {results.length} results • Found {dynamicColumns.length} data fields
          </div>
        </div>
      )}
    </div>
  );
}
