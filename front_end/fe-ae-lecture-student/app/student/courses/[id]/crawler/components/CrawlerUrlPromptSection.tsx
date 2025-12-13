// app/.../crawler/components/CrawlerUrlPromptSection.tsx
"use client";

import { Link, MessageSquare, Rocket, RotateCw, Cpu, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  prompt: string;
  onUrlChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onStartCrawl: () => void;
  submitting: boolean;
  chatConnected: boolean;
  crawlConnected: boolean;
  assignmentId?: string | null;
  promptUsed?: string;
  
  // Props mới cho Overlay
  isCrawling?: boolean;
  progress?: number;
  statusMessage?: string;
};

// Component Progress chuẩn style Shadcn/Tailwind
const Progress = ({ value = 0, className = "" }: { value?: number; className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
    <div
      className="h-full w-full flex-1 bg-[var(--brand)] transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);

export default function CrawlerUrlPromptSection({
  url,
  prompt,
  onUrlChange,
  onPromptChange,
  onStartCrawl,
  submitting,
  chatConnected,
  crawlConnected,
  assignmentId,
  promptUsed: _promptUsed,
  // Default values cho overlay
  isCrawling = false,
  progress = 0,
  statusMessage = "Initializing crawler agent...",
}: Props) {
  const disabled = submitting || !chatConnected || !crawlConnected || !assignmentId;

  // Fake progress animation để trải nghiệm mượt hơn khi chờ server
  const [fakeProgress, setFakeProgress] = useState(0);

  useEffect(() => {
    if (isCrawling && progress === 0) {
      setFakeProgress(0);
      const interval = setInterval(() => {
        setFakeProgress((prev) => {
          if (prev >= 90) return prev;
          const step = Math.max(1, (90 - prev) / 20);
          return prev + step;
        });
      }, 500);
      return () => clearInterval(interval);
    } else if (!isCrawling) {
      setFakeProgress(0);
    }
  }, [isCrawling, progress]);

  // Ưu tiên progress thật từ server, nếu server = 0 thì dùng fake
  const displayProgress = progress > 0 ? progress : fakeProgress;

  return (
    <>
      {/* === CARD CHÍNH === */}
      <div className="card p-5 relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--foreground)]">
              Crawl Configuration
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Set up your target and extraction rules
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] items-start">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                <Link className="h-3.5 w-3.5" />
                Target URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com/products"
                disabled={isCrawling || submitting}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                <MessageSquare className="h-3.5 w-3.5" />
                Extraction Instructions (Prompt)
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isCrawling || submitting}
                placeholder="E.g., Extract all product details including name, price, brand, and categories..."
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <button
              type="button"
              onClick={onStartCrawl}
              disabled={disabled || isCrawling}
              className="btn-gradient-slow w-full h-11 rounded-xl text-sm font-semibold shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {submitting || isCrawling ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Processing Job...</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  <span>Launch Smart Crawl</span>
                </>
              )}
            </button>

            <div className="space-y-2 pt-1" />
          </div>

          <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50/70 p-4 text-[11px] text-[var(--text-muted)]">
            <p className="mb-2 text-[11px] font-semibold text-[var(--foreground)]">
              Prompt guidance (English)
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Describe the goal and which sections to capture.</li>
              <li>Keep it natural language; no JSON formatting needed.</li>
              <li>Add rules for pagination, deduplication, and ignoring ads/popups.</li>
              <li>Mention selectors or keywords when the page is complex.</li>
            </ul>
            <div className="mt-3 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[11px] text-slate-700 shadow-sm">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Sample prompt
              </div>
              <p className="leading-snug">
                Get me the information for all products on this page, including images, brand, names,
                current prices, prices before discounts, and categories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === OVERLAY MÀN HÌNH TỐI (HIỆN KHI CRAWLING) === */}
      {isCrawling && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4 border border-slate-100">
            {/* Overlay Header */}
            <div className="mb-6 flex flex-col items-center text-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)]/10">
                <Cpu className="h-8 w-8 text-[var(--brand)] animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-[var(--brand)]/20 border-t-[var(--brand)] animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Smart Crawl Active</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-[280px] mx-auto truncate">
                  Target: {url}
                </p>
              </div>
            </div>

            {/* Progress Bar Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>{statusMessage}</span>
                <span>{Math.round(displayProgress)}%</span>
              </div>
              <Progress value={displayProgress} className="h-2.5" />
              <p className="text-[10px] text-slate-400 text-center mt-2">
                This process involves navigation, extraction, and AI analysis. Please wait.
              </p>
            </div>

            {/* ĐÃ XÓA PHẦN HIỂN THỊ JOB ID TẠI ĐÂY THEO YÊU CẦU */}
          </div>
        </div>
      )}
    </>
  );
}
