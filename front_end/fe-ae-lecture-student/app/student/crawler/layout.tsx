// app/student/crawler/layout.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Rocket,
  ArrowLeft,
  History,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Play,
  List,
} from "lucide-react";
import { useSmartCrawlHistory } from "@/hooks/smart-crawler/useSmartCrawlHistory";

const dt = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

export default function CrawlerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const search = useSearchParams();
  const tab = search.get("tab") || "start";

  const { loading, data, fetchHistory } = useSmartCrawlHistory();

  useEffect(() => {
    fetchHistory({ limit: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTab = (t: "start" | "history") => {
    const params = new URLSearchParams(search?.toString());
    params.set("tab", t);
    router.replace(`/student/crawler?${params.toString()}`, { scroll: false });
  };

  const btnCls = (t: string) =>
    tab === t
      ? "bg-[color-mix(in_oklab,var(--brand)_14%,#fff)] text-nav border border-brand"
      : "bg-white text-nav hover:text-nav-active border border-[var(--border)]";

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-nav">
          <Rocket className="w-6 h-6 text-nav-active" />
          <h1 className="text-2xl font-bold">Smart Crawler</h1>
        </div>
      
      </div>

      {/* 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-4">
          <div className="card rounded-2xl p-3">
            <div className="grid gap-2">
              <button
                className={`btn w-full ${btnCls("start")}`}
                onClick={() => setTab("start")}
              >
                <Play className="w-4 h-4" />
                Start crawl
              </button>
              <button
                className={`btn w-full ${btnCls("history")}`}
                onClick={() => setTab("history")}
              >
                <List className="w-4 h-4" />
                History
              </button>
            </div>
          </div>

          <div className="card rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-nav-active" />
                <h2 className="text-base font-bold text-nav">Recent history</h2>
              </div>
              <button
                className="btn bg-white border border-brand text-nav hover:text-nav-active px-2 py-1"
                onClick={() => fetchHistory({ limit: 12 })}
                aria-label="Refresh history"
                title="Refresh history"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {loading && (
                <div className="py-6 flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading history…
                </div>
              )}

              {!loading && (!data || data.length === 0) && (
                <div className="py-6 text-sm text-[var(--text-muted)]">
                  No history yet. Start a crawl to see it here.
                </div>
              )}

              {!loading &&
                Array.isArray(data) &&
                data.slice(0, 12).map((h) => (
                  <div key={h.id} className="py-3 flex items-start gap-3">
                    <div className="mt-0.5">
                      {h.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground break-words line-clamp-2">
                        {h.promptText || "(no prompt)"}
                      </div>
                      <div className="text-[12px] text-[var(--text-muted)] mt-1 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {dt(h.processedAt)}
                        </span>
                        {typeof h.processingTimeMs === "number" && (
                          <span>• {h.processingTimeMs} ms</span>
                        )}
                        {h.type && <span>• {h.type}</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-7">{children}</main>
      </div>
    </div>
  );
}
