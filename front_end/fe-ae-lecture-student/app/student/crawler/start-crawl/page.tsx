// app/student/crawler/start-crawl/page.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Link2,
  MessageSquareText,
  Loader2,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  Rocket,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSmartCrawl } from "@/hooks/smart-crawler/useSmartCrawl";

/* ===== utils ===== */
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const pad3 = (n: number) => (n < 10 ? `00${n}` : n < 100 ? `0${n}` : `${n}`);
const formatMs = (ms: number) => {
  if (!Number.isFinite(ms) || ms < 0) return "0:00.000";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${minutes}:${pad2(seconds)}.${pad3(millis)}`;
};

/**
 * progressEase: tạo % tiến độ dài hơi (không chạm 100% trước khi xong).
 * - Dùng hàm 1 - exp(-t / tau) và kẹp tối đa 92% (0.92)
 * - tau = 90s => ~60s đạt ~50%, ~180s đạt ~86%
 */
const progressEase = (elapsedMs: number, cap = 0.92, tau = 90_000) => {
  const p = 1 - Math.exp(-Math.max(0, elapsedMs) / tau);
  return Math.min(cap, p);
};

/** Suy đoán step dựa vào elapsed khi chưa có job stats realtime */
const inferStepIndex = (elapsedMs: number) => {
  // Mốc mềm (có thể >5p): chia đều + nới ở giữa
  if (elapsedMs < 20_000) return 0; // Queueing
  if (elapsedMs < 120_000) return 1; // Navigating
  if (elapsedMs < 240_000) return 2; // Extracting
  if (elapsedMs < 360_000) return 3; // Post-processing
  return 4; // Saving
};

const STEPS = ["Queueing", "Navigating", "Extracting", "Post-processing", "Saving"] as const;

export default function StartCrawlPanel() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const { loading, data, crawl, reset } = useSmartCrawl();

  const canStart = useMemo(
    () => url.trim().length > 0 && prompt.trim().length > 0 && !loading,
    [url, prompt, loading]
  );

  // ===== Timer & overlay state =====
  const startAtRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false); // popup center
  const [minimized, setMinimized] = useState(false); // thu nhỏ overlay

  // Khi loading, bật overlay + chạy đồng hồ
  useEffect(() => {
    let id: number | null = null;
    if (loading) {
      setOverlayOpen(true);
      if (startAtRef.current == null) startAtRef.current = performance.now();

      const tick = () => {
        if (startAtRef.current != null) {
          setElapsed(performance.now() - startAtRef.current);
        }
        id = requestAnimationFrame(tick);
        rafRef.current = id;
      };
      id = requestAnimationFrame(tick);
      rafRef.current = id;
    } else {
      // dừng timer; giữ overlay mở tới khi hiển thị result card bên phải
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startAtRef.current = null;
    }
    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [loading]);

  const onStart = async () => {
  setElapsed(0);
  setMinimized(false);
  setOverlayOpen(true);
  startAtRef.current = performance.now();
  await crawl({ url: url.trim(), prompt: prompt.trim() });
  try {
    window.dispatchEvent(new CustomEvent("smart-crawl:history:refresh"));
  } catch {}
};
  // progress percentage (0..100) nhưng không quá 92 khi đang chạy
  const pct = Math.round(progressEase(elapsed) * 100);

  // step highlight
  const activeStep = inferStepIndex(elapsed);

  return (
    <>
      {/* ======= Overlay (modal) khi đang chạy hoặc vừa chạy xong ======= */}
      {overlayOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Smart crawl progress"
        >
          <div className="w-full max-w-2xl">
            <div className="card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)] bg-white">
                <div className="flex items-center gap-2 text-nav">
                  <Rocket className="w-5 h-5 text-nav-active" />
                  <h3 className="font-bold">Smart Crawler</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn bg-white border border-brand text-nav hover:text-nav-active"
                    onClick={() => setMinimized((v) => !v)}
                    aria-label={minimized ? "Expand" : "Minimize"}
                  >
                    {minimized ? "Expand" : "Minimize"}
                  </button>
                  {!loading && (
                    <button
                      className="btn bg-white border border-brand text-nav hover:text-nav-active"
                      onClick={() => setOverlayOpen(false)}
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              {!minimized ? (
                <div className="p-4 bg-white">
                  {/* URL & Prompt tóm tắt */}
                  <div className="text-sm text-foreground/80 space-y-1 mb-3">
                    <div className="truncate"><b>URL:</b> {url || "—"}</div>
                    <div className="truncate">
                      <b>Prompt:</b>{" "}
                      {prompt ? (prompt.length > 160 ? `${prompt.slice(0, 160)}…` : prompt) : "—"}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="w-4 h-4 text-nav-active" />
                      <span className="font-mono">{formatMs(elapsed)}</span>
                    </div>
                    <div className="text-sm font-semibold">{loading ? `${pct}%` : "100%"}</div>
                  </div>
                  <div className="mt-2 h-2 w-full bg-[rgba(0,0,0,0.06)] rounded overflow-hidden">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: loading ? `${pct}%` : "100%",
                        transition: "width .35s ease",
                        background:
                          "linear-gradient(90deg, color-mix(in oklab, var(--brand) 65%, #fff), var(--nav-active))",
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <ol className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {STEPS.map((s, i) => {
                      const done = !loading || i < activeStep;
                      const current = loading && i === activeStep;
                      return (
                        <li
                          key={s}
                          className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                            done
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : current
                              ? "border-brand bg-[color-mix(in_oklab,var(--brand)_12%,#fff)] text-nav"
                              : "border-[var(--border)] bg-white text-foreground/70"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : current ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-[var(--border)] inline-block" />
                          )}
                          <span className="truncate">{s}</span>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Footer notice */}
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    The crawler can run for several minutes on complex pages. This window updates live; you can minimize
                    it and continue editing.
                  </p>
                </div>
              ) : (
                // Minimized slim bar
                <div className="p-3 bg-white">
                  <div className="flex items-center gap-2">
                    <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""} text-nav-active`} />
                    <div className="text-sm font-medium">
                      {loading ? "Running…" : "Completed"}
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-sm">
                      <Timer className="w-4 h-4 text-nav-active" />
                      <span className="font-mono">{formatMs(elapsed)}</span>
                      <div className="w-24 h-2 bg-[rgba(0,0,0,0.06)] rounded overflow-hidden">
                        <div
                          className="h-2"
                          style={{
                            width: loading ? `${pct}%` : "100%",
                            transition: "width .35s ease",
                            background:
                              "linear-gradient(90deg, color-mix(in oklab, var(--brand) 65%, #fff), var(--nav-active))",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======= Trang chính (form + result sidebar) ======= */}
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
              disabled={loading}
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
              disabled={loading}
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

          {!loading && data && (
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

              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span><b>Job ID:</b> {data.jobId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  <span>
                    <b>Execution:</b> {formatMs(Math.max(0, Number(data.executionTimeMs || 0)))}
                    <span className="opacity-60"> ({Math.max(0, Number(data.executionTimeMs || 0))} ms)</span>
                  </span>
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
    </>
  );
}
