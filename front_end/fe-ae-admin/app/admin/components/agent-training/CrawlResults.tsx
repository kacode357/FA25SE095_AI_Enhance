"use client";

import React from "react";
import type { CrawlResult } from "@/types/agent-training/training.types";

interface CrawlResultsProps {
  result: CrawlResult | null;
}

export const CrawlResults: React.FC<CrawlResultsProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Submit a crawl job to see results here.
      </div>
    );
  }

  const { success, data, metadata, base_reward, error } = result;
  const rewardPct = (base_reward * 100).toFixed(1);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">
            {success ? "✓ Crawl Successful" : "✗ Crawl Failed"}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span>
              <span className="font-medium text-slate-500">Job ID:</span>{" "}
              {result.job_id}
            </span>
            <span>
              <span className="font-medium text-slate-500">Pages:</span>{" "}
              {metadata.pages_collected}
            </span>
            <span>
              <span className="font-medium text-slate-500">Time:</span>{" "}
              {metadata.execution_time_ms}ms
            </span>
            <span>
              <span className="font-medium text-slate-500">Domain:</span>{" "}
              {metadata.domain}
            </span>
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          Reward: {rewardPct}%
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {success && data && data.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <h4 className="font-semibold">
              Extracted Data ({data.length} items)
            </h4>
            <span>Total items: {data.length}</span>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-2 text-xs font-mono text-slate-800">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-2"
              >
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {success && (!data || data.length === 0) && (
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          No data extracted. The crawl succeeded but found no matching content.
        </div>
      )}

      <div className="space-y-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${base_reward * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-700">
          Quality Score: {rewardPct}%
          {base_reward < 0.5 && " - Consider providing feedback"}
          {base_reward >= 0.5 &&
            base_reward < 0.8 &&
            " - Good, but can improve"}
          {base_reward >= 0.8 && " - Excellent!"}
        </p>
      </div>
    </div>
  );
};
