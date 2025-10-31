// app/student/crawler/history-crawl/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  History,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Timer,
} from "lucide-react";
import { useSmartCrawlHistory } from "@/hooks/smart-crawler/useSmartCrawlHistory";

const dt = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

export default function HistoryCrawlPanel() {
  const [limit, setLimit] = useState(50);
  const { loading, data, fetchHistory } = useSmartCrawlHistory();

  useEffect(() => {
    fetchHistory({ limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div className="space-y-4">
      {/* Small local header for context only */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-nav">
          <History className="w-5 h-5 text-nav-active" />
          <h2 className="text-base font-bold">History</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border border-[var(--border)] rounded-md p-2 bg-white text-sm"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={20}>Last 20</option>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
          </select>
          <button
            className="btn bg-white border border-brand text-nav hover:text-nav-active px-2 py-1"
            onClick={() => fetchHistory({ limit })}
            title="Refresh"
            aria-label="Refresh"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="card rounded-2xl p-4">
        {loading && (
          <div className="py-10 flex items-center gap-2 justify-center text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        )}

        {!loading && (!data || data.length === 0) && (
          <div className="py-10 text-center text-sm text-[var(--text-muted)]">
            No records yet.
          </div>
        )}

        {!loading && Array.isArray(data) && data.length > 0 && (
          <ul className="divide-y divide-[var(--border)]">
            {data.map((h) => (
              <li key={h.id} className="py-3 flex items-start gap-3">
                <div className="mt-0.5">
                  {h.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground break-words">
                    {h.promptText || "(no prompt)"}
                  </div>
                  <div className="text-[12px] text-[var(--text-muted)] mt-1 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {dt(h.processedAt)}
                    </span>
                    {typeof h.processingTimeMs === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        {h.processingTimeMs} ms
                      </span>
                    )}
                    {h.type && <span>• {h.type}</span>}
                  </div>
                  {h.crawlJobId && (
                    <div className="text-[12px] text-[var(--text-muted)] mt-1">
                      Job: {h.crawlJobId}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
