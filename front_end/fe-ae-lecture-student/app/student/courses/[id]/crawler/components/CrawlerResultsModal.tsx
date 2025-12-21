"use client";

import { useCallback } from "react";
import { X } from "lucide-react";

import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";
import type { JobHistoryEntry } from "../crawler-types";
import CrawlerResultsTabs from "./CrawlerResultsTabs";

type Props = {
  open: boolean;
  onClose: () => void;
  activeJobId: string | null;
  conversationId: string | null;
  courseSlug: string;
  assignmentId: string | null;
  results: SmartCrawlJobResultItem[];
  resultsLoading: boolean;
  historyIndex?: number;
  currentSummary?: string;
  currentPrompt?: string;
  jobHistory?: JobHistoryEntry[];
  onSelectHistoryIndex?: (index: number) => void;
};

export default function CrawlerResultsModal({
  open,
  onClose,
  activeJobId,
  conversationId,
  courseSlug,
  assignmentId,
  results,
  resultsLoading,
  historyIndex,
  currentSummary,
  currentPrompt,
  jobHistory,
  onSelectHistoryIndex,
}: Props) {
  const handleOpenDataPage = useCallback(() => {
    if (!activeJobId) return;
    const courseSegment = courseSlug || assignmentId || "unknown";
    const params = new URLSearchParams({ jobId: activeJobId });
    if (conversationId) params.set("conversationId", conversationId);
    const href = `/student/courses/${courseSegment}/crawler/data?${params.toString()}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }, [activeJobId, assignmentId, conversationId, courseSlug]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]" data-tour="crawler-results">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative flex w-full max-w-6xl max-h-[90vh] flex-col rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              Crawled Data
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenDataPage}
                disabled={!activeJobId}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--foreground)] shadow-sm hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open data in new page
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-red-50 transition"
                title="Close"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50/40 p-4">
            <CrawlerResultsTabs
              conversationId={conversationId}
              results={results}
              resultsLoading={resultsLoading}
              historyIndex={historyIndex}
              currentSummary={currentSummary}
              currentPrompt={currentPrompt}
              jobHistory={jobHistory}
              onSelectHistoryIndex={onSelectHistoryIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
