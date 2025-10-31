// app/student/crawler/start-crawl/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Link2,
  MessageSquareText,
  Loader2,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useSmartCrawl } from "@/hooks/smart-crawler/useSmartCrawl";

export default function StartCrawlPanel() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const { loading, data, crawl, reset } = useSmartCrawl();

  const canStart = useMemo(
    () => url.trim().length > 0 && prompt.trim().length > 0 && !loading,
    [url, prompt, loading]
  );

  const onStart = async () => {
    await crawl({ url: url.trim(), prompt: prompt.trim() });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
      {/* LEFT: Form */}
      <section className="xl:col-span-7 space-y-6">
        {/* URL */}
        <div className="card rounded-2xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-nav-active" />
            <h3 className="text-base font-bold text-nav">Target URL</h3>
          </div>
          <input
            className="input"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            The crawl only runs when you click <b>Start crawl</b>.
          </p>
        </div>

        {/* Prompt */}
        <div className="card rounded-2xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-nav-active" />
            <h3 className="text-base font-bold text-nav">Instruction (Prompt)</h3>
          </div>
          <textarea
            className="w-full rounded-lg border border-[var(--border)] p-3 text-sm bg-white outline-none"
            rows={8}
            placeholder={`Examples:\n• Extract all product titles and prices\n• Summarize key points from this article\n• Find contact emails and social links`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            Be specific: what to extract, constraints, expected output.
          </div>
        </div>
      </section>

      {/* RIGHT: Actions + Result */}
      <aside className="xl:col-span-3 space-y-4">
        <div className="card rounded-2xl p-4">
          <h3 className="text-base font-bold text-nav mb-2">Action</h3>

          <button
            className="btn w-full btn-gradient-slow disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onStart}
            disabled={!canStart}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Starting…</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Start crawl</span>
              </>
            )}
          </button>

          {!url.trim() && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Enter a URL to enable the button.
            </p>
          )}
          {!prompt.trim() && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Enter a prompt to enable the button.
            </p>
          )}
        </div>

        {data && (
          <div
            className={`card rounded-2xl p-4 ${
              data.success ? "border border-emerald-200 bg-emerald-50" : "border border-red-200 bg-red-50"
            }`}
          >
            <div className={`mb-2 flex items-center gap-2 ${data.success ? "text-emerald-700" : "text-red-700"}`}>
              {data.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <h4 className="text-base font-bold">
                {data.success ? "Job started" : "Failed to start"}
              </h4>
            </div>

            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span><b>Job ID:</b> {data.jobId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span><b>Execution:</b> {data.executionTimeMs} ms</span>
              </div>
              <div><b>Results:</b> {data.resultCount}</div>
              {data.failedStep != null && data.failedStep > 0 && (
                <div><b>Failed step:</b> {data.failedStep}</div>
              )}
              {data.errorMessage && (
                <div className="text-xs opacity-80">
                  <b>Message:</b> {data.errorMessage}
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                className="btn bg-white border border-brand text-nav hover:text-nav-active"
                onClick={reset}
              >
                Reset
              </button>
              <Link
                href="/student/crawler?tab=history"
                className="btn bg-white border border-brand text-nav hover:text-nav-active"
                replace
              >
                View history
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
