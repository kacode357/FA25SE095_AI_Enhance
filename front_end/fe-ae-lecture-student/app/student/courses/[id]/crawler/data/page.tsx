"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSmartCrawlerJobResults } from "@/hooks/smart-crawler/useSmartCrawlerJobResults";
import CrawlerResultsTabs from "../components/CrawlerResultsTabs";

const DataContent = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const conversationId = searchParams.get("conversationId");

  const { fetchJobResults, loading, results } = useSmartCrawlerJobResults();

  useEffect(() => {
    if (jobId) {
      fetchJobResults(jobId).catch(() => {});
    }
  }, [jobId, fetchJobResults]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
        <header className="flex items-center justify-between bg-amber-300">
          <div>
            <div className="text-lg font-semibold text-[var(--foreground)]">
              Crawled Data
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              View and explore your crawl results comfortably.
            </p>
          </div>
          <a
            href="."
            className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] shadow-sm hover:bg-slate-50"
          >
            Back to workspace
          </a>
        </header>

        {!jobId ? (
          <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-muted)]">
            Missing job id. Please open this page from the crawler workspace after a crawl completes.
          </div>
        ) : (
          <CrawlerResultsTabs
            conversationId={conversationId}
            results={results}
            resultsLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default function CrawlerDataPage() {
  return (
    <Suspense>
      <DataContent />
    </Suspense>
  );
}
