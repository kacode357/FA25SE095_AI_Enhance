"use client";

import React, { useCallback, useEffect, useState } from "react";

import wsService from "@/services/agent-training.websocket";
import type {
  QueueStatus,
  WebSocketMessageType,
} from "@/types/agent-training/training.types";

const QUEUE_CACHE_KEY = "__ae_queue_status_cache__";

const getQueueCache = (): QueueStatus | null =>
  (globalThis as Record<string, any>)[QUEUE_CACHE_KEY] || null;

const setQueueCache = (data: QueueStatus | null) => {
  (globalThis as Record<string, any>)[QUEUE_CACHE_KEY] = data;
};

interface QueueMonitorProps {
  getQueueStatus: () => Promise<QueueStatus>;
  initialQueueStatus?: QueueStatus | null;
  onNotify?: (message: string) => void;
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({
  getQueueStatus,
  initialQueueStatus,
  onNotify,
}) => {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fetchQueueStatus = useCallback(
    async (options?: { initial?: boolean }) => {
      const isInitial = options?.initial ?? false;
      if (isInitial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        setError(null);
        const status = await getQueueStatus();
        setQueueCache(status);
        setQueueStatus(status);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch queue status";
        setError(message);
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
      },
    [getQueueStatus]
    );

  useEffect(() => {
    const cached = getQueueCache();
    if (cached) {
      setQueueStatus(cached);
      setLoading(false);
      return;
    }
    if (initialQueueStatus) {
      setQueueStatus(initialQueueStatus);
      setQueueCache(initialQueueStatus);
      setLoading(false);
      return;
    }
    fetchQueueStatus({ initial: true });
  }, [fetchQueueStatus, initialQueueStatus]);

  useEffect(() => {
    const queueEvents: WebSocketMessageType[] = [
      "training_queued",
      "training_started",
      "training_completed",
      "training_failed",
      "job_completed",
      "version_committed",
      "buffer_discarded",
      "queue_updated",
    ];

    const handleQueueUpdate = () => {
      fetchQueueStatus();
    };

    queueEvents.forEach((event) => wsService.on(event, handleQueueUpdate));
    return () => {
      queueEvents.forEach((event) => wsService.off(event, handleQueueUpdate));
    };
  }, [fetchQueueStatus]);

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-600">
        Loading queue status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p>{error}</p>
        <button
          type="button"
          className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
          onClick={() => {
            fetchQueueStatus();
            onNotify?.("Retrying queue status fetch...");
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!queueStatus) {
    return (
      <div className="text-sm text-slate-600">
        No queue data available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Training Queue Status
          </h2>
          <p className="text-xs text-slate-500">
            Monitor active and pending training jobs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchQueueStatus()}
          disabled={refreshing}
          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Active Jobs</p>
          <p className="text-2xl font-semibold text-slate-900">
            {queueStatus.active_jobs?.length || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Pending Jobs</p>
          <p className="text-2xl font-semibold text-slate-900">
            {queueStatus.summary?.pending_count || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Processed Total</p>
          <p className="text-2xl font-semibold text-slate-900">
            {queueStatus.summary?.total_processed || 0}
          </p>
        </div>
      </div>

      {queueStatus.active_jobs && queueStatus.active_jobs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Currently Training
          </h3>
          <div className="space-y-3">
            {queueStatus.active_jobs.map((job) => (
              <div
                key={job.job_id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Training request
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    ACTIVE
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-slate-600">
                  <div className="flex gap-2">
                    <dt className="w-20 font-medium text-slate-500">URL:</dt>
                    <dd className="flex-1 break-all text-indigo-600">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {job.url}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 font-medium text-slate-500">
                      Prompt:
                    </dt>
                    <dd className="flex-1">{job.description}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {queueStatus.pending_jobs && queueStatus.pending_jobs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Queued Jobs ({queueStatus.pending_jobs.length})
          </h3>
          <div className="space-y-3">
            {queueStatus.pending_jobs.map((job, index) => (
              <div
                key={job.job_id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Training request
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    Position #{index + 1}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-slate-600">
                  <div className="flex gap-2">
                    <dt className="w-20 font-medium text-slate-500">URL:</dt>
                    <dd className="flex-1 break-all text-indigo-600">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {job.url}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 font-medium text-slate-500">
                      Prompt:
                    </dt>
                    <dd className="flex-1">{job.prompt}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 font-medium text-slate-500">
                      Queued:
                    </dt>
                    <dd className="flex-1">
                      {formatTimestamp(job.timestamp)}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!queueStatus.active_jobs || queueStatus.active_jobs.length === 0) &&
        (!queueStatus.pending_jobs || queueStatus.pending_jobs.length === 0) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Queue is empty. Submit a training job to get started.
          </div>
        )}
    </div>
  );
};
