// app/.../crawler/components/CrawlerResultsSection.tsx
"use client";

import type { CrawlSummary } from "../crawler-types";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";

/** Helper: chọn các field “đẹp” để hiện trong bảng từ extractedData */
function getDisplayFromExtracted(extracted?: Record<string, any> | null) {
  if (!extracted) {
    return {
      label: "N/A",
      details: "",
      categories: "",
    };
  }

  const entries = Object.entries(extracted);

  let labelEntry =
    entries.find(([k, v]) => typeof v === "string" && /name|title/i.test(k)) ||
    entries.find(([_, v]) => typeof v === "string");

  const label = labelEntry ? (labelEntry[1] as string) : "N/A";
  const labelKey = labelEntry?.[0];

  const categoryEntry =
    entries.find(
      ([k, v]) => Array.isArray(v) && /category|tags|genres?/i.test(k)
    ) || entries.find(([_, v]) => Array.isArray(v));
  const categories =
    categoryEntry && Array.isArray(categoryEntry[1])
      ? (categoryEntry[1] as any[])
          .map((x) => String(x))
          .filter(Boolean)
          .join(", ")
      : "";

  const detailsPairs: string[] = [];
  for (const [k, v] of entries) {
    if (k === labelKey || k === categoryEntry?.[0]) continue;
    if (v === null || v === undefined) continue;

    if (
      typeof v === "number" ||
      typeof v === "string" ||
      typeof v === "boolean"
    ) {
      detailsPairs.push(`${k}: ${v}`);
    } else if (Array.isArray(v)) {
      const text = v
        .slice(0, 5)
        .map((x) => String(x))
        .join(", ");
      detailsPairs.push(`${k}: ${text}`);
    }
  }

  const details = detailsPairs.join(" • ");

  return { label, details, categories };
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-slate-800">
        📋 Crawl Results
      </div>

      {showEmpty ? (
        <div className="flex h-[260px] flex-col items-center justify-center text-center text-xs text-slate-400">
          <div className="mb-2 text-2xl">🕸️</div>
          <p>Chưa có kết quả. Hãy tạo một crawl job trước.</p>
        </div>
      ) : (
        <div className="max-h-[320px] overflow-auto rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left w-[40px]">
                  #
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">
                  Item
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">
                  Key details
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">
                  Categories
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">
                  Source URL
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => {
                const view = getDisplayFromExtracted(item.extractedData);
                return (
                  <tr
                    key={item.id}
                    className="odd:bg-white even:bg-slate-50/60 align-top"
                  >
                    <td className="border-b border-slate-100 px-3 py-2 text-[11px] text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <div className="font-medium text-slate-900">
                        {view.label}
                      </div>
                      {item.httpStatusCode !== 0 && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          HTTP: {item.httpStatusCode} • {item.responseTimeMs}ms
                        </div>
                      )}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <div className="text-[11px] text-slate-700">
                        {view.details || (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      {view.categories ? (
                        <div className="flex flex-wrap gap-1">
                          {view.categories
                            .split(",")
                            .map((c) => c.trim())
                            .filter(Boolean)
                            .map((c, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-slate-100 px-2 py-[1px] text-[10px] text-slate-700"
                              >
                                {c}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="max-w-[220px] truncate text-[11px] text-sky-600 underline-offset-2 hover:underline"
                      >
                        {item.url}
                      </a>
                      <div className="mt-1 text-[10px] text-slate-400">
                        {new Date(item.crawledAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary nhỏ phía dưới */}
      <div className="border-t border-slate-200 pt-3 mt-3">
        {summaryError && (
          <p className="mb-2 text-[11px] text-red-500">❌ {summaryError}</p>
        )}
        {!summary && !summaryLoading && (
          <p className="text-[11px] text-slate-400">
            Summary sẽ xuất hiện ở đây sau khi Agent trả về{" "}
            <code className="rounded bg-slate-100 px-1">
              messageType 5 (AiSummary)
            </code>{" "}
            cho một crawl job (thường là khi mày hỏi có chứa từ khoá kiểu
            &quot;summary / insights / tóm tắt ...&quot;).
          </p>
        )}
        {summaryLoading && (
          <p className="text-[11px] text-slate-400">
            🧠 Đang lấy crawl summary từ Agent...
          </p>
        )}
        {summary && (
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-3 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <span>🧠 Crawl Summary</span>
                {activeJobId && (
                  <span className="text-[10px] font-normal text-slate-500">
                    Job {activeJobId.slice(0, 8)}…
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <p className="mb-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-800">
              {summary.summaryText || "No summary text available."}
            </p>

            <div className="mb-2 rounded-lg bg-white/80 px-3 py-2 text-[11px] text-slate-800">
              <div className="mb-1 font-semibold text-slate-900">
                Key Insights
              </div>
              {summary.insightHighlights &&
              summary.insightHighlights.length > 0 ? (
                <ul className="list-disc pl-4 space-y-0.5">
                  {summary.insightHighlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Agent chưa highlight insight cụ thể.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
              <div className="flex-1 min-w-[120px]">
                <span className="font-semibold">Coverage: </span>
                {summary.fieldCoverage && summary.fieldCoverage.length > 0
                  ? summary.fieldCoverage
                      .slice(0, 3)
                      .map((f) => `${f.fieldName}: ${f.coveragePercent}%`)
                      .join(" • ")
                  : "N/A"}
              </div>
              <div className="flex-1 min-w-[120px]">
                <span className="font-semibold">Charts: </span>
                {summary.chartPreviews && summary.chartPreviews.length > 0
                  ? summary.chartPreviews
                      .slice(0, 2)
                      .map((c) => `${c.title} (${c.chartType || "N/A"})`)
                      .join(" • ")
                  : "No chart previews"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
