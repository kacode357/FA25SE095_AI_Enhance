// app/.../crawler/components/CrawlerUrlPromptSection.tsx
"use client";

import { Link, MessageSquare, Rocket, RotateCw, Cpu, Settings2, Layers, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Predefined max pages options (max 5 pages)
const MAX_PAGES_OPTIONS = [
  { value: "auto", label: "Not specified" },
  { value: 1, label: "1 page only" },
  { value: 2, label: "Up to 2 pages" },
  { value: 3, label: "Up to 3 pages" },
  { value: 5, label: "Up to 5 pages" },
] as const;

type Props = {
  url: string;
  prompt: string;
  maxPages: number | null;
  onUrlChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onMaxPagesChange: (value: number | null) => void;
  onStartCrawl: () => void;
  submitting: boolean;
  chatConnected: boolean;
  crawlConnected: boolean;
  promptUsed?: string;
  activeTargetUrl?: string;
  
  // Props mới cho Overlay
  isCrawling?: boolean;
  progress?: number;
  statusMessage?: string;
};


export default function CrawlerUrlPromptSection({
  url,
  prompt,
  maxPages,
  onUrlChange,
  onPromptChange,
  onMaxPagesChange,
  onStartCrawl,
  submitting,
  chatConnected,
  crawlConnected,
  promptUsed: _promptUsed,
  activeTargetUrl,
  // Default values cho overlay
  isCrawling = false,
  progress = 0,
  statusMessage = "Initializing crawler agent...",
}: Props) {
  const disabled = submitting || !chatConnected || !crawlConnected;
  const displayProgress = progress;
  const displayTarget = activeTargetUrl || url;

  const handleMaxPagesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    // "auto" means null (don't send maxPages, let AI decide)
    const parsedVal = val === "auto" ? null : Number(val);
    console.log("[MaxPages] Select changed - raw value:", val, "parsed:", parsedVal);
    onMaxPagesChange(parsedVal);
  };

  // Debug: Log current maxPages value
  console.log("[MaxPages] Current maxPages prop:", maxPages);

  return (
    <>
      {/* === CARD CHÍNH === */}
      <div className="card p-5 relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--foreground)]">
              Crawl Configuration
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Set up your target and extraction rules
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 items-stretch">
          {/* === CỘT TRÁI: URL + Prompt === */}
          <div className="space-y-4 flex flex-col">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                <Link className="h-3.5 w-3.5" />
                Target URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com/products"
                disabled={isCrawling || submitting}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[13px] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                <MessageSquare className="h-3.5 w-3.5" />
                Extraction Instructions (Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isCrawling || submitting}
                placeholder="E.g., Extract all product details including name, price, brand, and categories..."
                className="flex-1 w-full resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[13px] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* === CỘT PHẢI: Max Pages + Tips === */}
          <div className="space-y-4 flex flex-col">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                <Layers className="h-3.5 w-3.5" />
                Max Pages to Crawl
              </label>
              <select
                value={maxPages === null ? "auto" : maxPages}
                onChange={handleMaxPagesChange}
                disabled={isCrawling || submitting}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[13px] outline-none transition-all focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:bg-slate-50 disabled:text-slate-500"
              >
                {MAX_PAGES_OPTIONS.map((opt) => (
                  <option key={String(opt.value)} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-400">
                If selected, this overrides any page count in your prompt.
              </p>
            </div>

            {/* === Prompt Guidance Box === */}
            <div className="flex-1 rounded-xl border border-dashed border-[var(--border)] bg-slate-50/70 p-3 text-[11px] text-[var(--text-muted)] flex flex-col">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--foreground)]">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Prompt Tips
              </div>
              <ul className="list-disc space-y-1.5 pl-4 text-[10px]">
                <li>Describe what data you want to extract clearly.</li>
                <li>Use natural language, no JSON needed.</li>
                <li>Mention pagination rules if the site has multiple pages.</li>
              </ul>
              <p className="mt-3 text-[10px] text-slate-500">
                <span className="font-medium">Example:</span>{" "}
                <span className="italic text-slate-400">
                  &quot;Get all products with name, price, brand, and image URL.&quot;
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* === NÚT LAUNCH === */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onStartCrawl}
            disabled={disabled || isCrawling}
            className="btn-gradient-slow w-full h-11 rounded-xl text-[13px] font-semibold shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
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
        </div>
      </div>

      {/* === OVERLAY MÀN HÌNH TỐI (HIỆN KHI CRAWLING) === */}
      {isCrawling && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.2)] mx-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10">
                <Cpu className="h-7 w-7 text-[var(--brand)] animate-pulse" />
                <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-[var(--brand)] shadow-sm" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900">Smart Crawl Active</h3>
                <p className="mt-1 text-[11px] text-slate-500 truncate">
                  Target: {displayTarget || "Waiting for target..."}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="truncate">{statusMessage}</span>
                <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand)]">
                  {Math.round(displayProgress)}%
                </span>
              </div>
              <Progress
                value={displayProgress}
                className="h-2.5 bg-slate-200/70"
                indicatorClassName="bg-[var(--brand)]"
              />
              <p className="text-[10px] text-slate-400">
                The crawler is navigating, extracting, and analyzing data.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

