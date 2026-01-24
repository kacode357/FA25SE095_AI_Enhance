"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  MutableRefObject,
} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import wsService from "@/services/agent-training.websocket";
import type {
  TrainingStats,
  PendingRolloutsUpdate,
  WebSocketMessageType,
  LearningInsights,
  QueueStatus,
  BufferMetadata,
  PendingCommitsStatus,
  VersionHistoryResponse,
} from "@/types/agent-training/training.types";

const STAT_CACHE_KEY = "__ae_training_stats_cache__";

const getStatsCache = (): TrainingStats | null =>
  (globalThis as Record<string, any>)[STAT_CACHE_KEY] || null;

const setStatsCache = (data: TrainingStats | null) => {
  (globalThis as Record<string, any>)[STAT_CACHE_KEY] = data;
};

interface QueueSnapshot {
  pending: number;
  active: number;
  completed: number;
}

interface CommitProgress {
  count: number;
  threshold: number;
}

interface BufferSnapshot {
  pending: number;
  total: number;
}

interface ExportResourcesResponse {
  filename: string;
  version: number;
}

interface LearningDashboardProps {
  getStats: (signal?: AbortSignal) => Promise<TrainingStats>;
  getQueueStatus: () => Promise<QueueStatus>;
  getPendingCommitsStatus: () => Promise<PendingCommitsStatus>;
  listBuffers: () => Promise<BufferMetadata[]>;
  getPendingBuffers: () => Promise<BufferMetadata[]>;
  getVersionHistory: () => Promise<VersionHistoryResponse>;
  getLearningInsights: () => Promise<LearningInsights>;
  exportResources: () => Promise<ExportResourcesResponse>;
  initialStats?: TrainingStats | null;
  initialQueueStatus?: QueueStatus | null;
  initialCommitStatus?: PendingCommitsStatus | null;
  initialVersionHistory?: VersionHistoryResponse | null;
  initialInsights?: LearningInsights | null;
  onNotify?: (message: string) => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  getStats,
  getQueueStatus,
  getPendingCommitsStatus,
  listBuffers,
  getPendingBuffers,
  getVersionHistory,
  getLearningInsights,
  exportResources,
  initialStats,
  initialQueueStatus,
  initialCommitStatus,
  initialVersionHistory,
  initialInsights,
  onNotify,
}) => {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [maxRollouts, setMaxRollouts] = useState<number>(5);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [queueStats, setQueueStats] = useState<QueueSnapshot>({
    pending: 0,
    active: 0,
    completed: 0,
  });
  const [commitProgress, setCommitProgress] = useState<CommitProgress>({
    count: 0,
    threshold: 5,
  });
  const [bufferStats, setBufferStats] = useState<BufferSnapshot>({
    pending: 0,
    total: 0,
  });
  const [latestVersion, setLatestVersion] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef: MutableRefObject<boolean> = useRef(false);

  const loadStats = useCallback(async (options?: { initial?: boolean }) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const data = await getStats(abortControllerRef.current.signal);
      setStatsCache(data);
      setStats(data);
      setError(null);
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.name !== "AbortError" &&
        err.name !== "CanceledError"
      ) {
        setError("Failed to load statistics");
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }
      }
    } finally {
      if (options?.initial) {
        setLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [getStats]);

  const loadInitialData = useCallback(async () => {
    try {
      const queueStatus = await getQueueStatus();
      setQueueStats({
        pending: queueStatus.summary?.pending_count || 0,
        active: queueStatus.summary?.active_count || 0,
        completed: queueStatus.summary?.completed_count || 0,
      });

      const commitStatus = await getPendingCommitsStatus();
      setCommitProgress({
        count: commitStatus.pending_count || 0,
        threshold: commitStatus.threshold || 5,
      });

      const [allBuffers, pendingBuffers] = await Promise.all([
        listBuffers(),
        getPendingBuffers(),
      ]);
      setBufferStats({
        pending: pendingBuffers.length,
        total: allBuffers.length,
      });

      const versionData = await getVersionHistory();
      setLatestVersion(versionData.current_version ?? null);

      const insightsData = await getLearningInsights();
      setInsights(insightsData);

      setLastUpdate(new Date());
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load dashboard data", err);
      }
    }
  }, [
    getQueueStatus,
    getPendingCommitsStatus,
    listBuffers,
    getPendingBuffers,
    getVersionHistory,
    getLearningInsights,
  ]);

  useEffect(() => {
    const cached = getStatsCache();
    if (cached) {
      setStats(cached);
      setLoading(false);
      return;
    }
    if (initialStats) {
      setStats(initialStats);
      setStatsCache(initialStats);
      setLoading(false);
      return;
    }
    loadStats({ initial: true });
  }, [initialStats, loadStats]);

  useEffect(() => {
    if (
      initialQueueStatus &&
      initialCommitStatus &&
      initialVersionHistory &&
      initialInsights
    ) {
      setQueueStats({
        pending: initialQueueStatus.summary?.pending_count || 0,
        active: initialQueueStatus.summary?.active_count || 0,
        completed: initialQueueStatus.summary?.completed_count || 0,
      });

      setCommitProgress({
        count: initialCommitStatus.pending_count || 0,
        threshold: initialCommitStatus.threshold || 5,
      });

      setLatestVersion(initialVersionHistory.current_version ?? null);
      setInsights(initialInsights);
      setLastUpdate(new Date());
      // Fetch buffers separately since they're not passed as props anymore
      Promise.all([listBuffers(), getPendingBuffers()])
        .then(([all, pending]) => setBufferStats({ pending: pending.length, total: all.length }))
        .catch(console.error);
      return;
    }

    loadInitialData();
  }, [
    initialQueueStatus,
    initialCommitStatus,
    initialVersionHistory,
    initialInsights,
    loadInitialData,
    listBuffers,
    getPendingBuffers,
  ]);

  useEffect(() => {
    const handleRolloutUpdate = (data: PendingRolloutsUpdate) => {
      setPendingCount(data.pending_count);
      setMaxRollouts(data.update_frequency);
      setCurrentCycle(data.cycle);
      setLastUpdate(new Date());
    };

    const refreshEvents: WebSocketMessageType[] = [
      "learning_cycle_complete",
      "training_completed",
      "training_failed",
      "job_completed",
      "version_committed",
      "version_created",
      "feedback_received",
    ];

    const refreshHandler = () => {
      loadStats();
      setLastUpdate(new Date());
    };

    const handleQueueUpdate = (data: any) => {
      const snapshot = data.queue_status || data;
      setQueueStats({
        pending: snapshot.pending_count || 0,
        active: snapshot.active_count || 0,
        completed: snapshot.completed_count || 0,
      });
      setLastUpdate(new Date());
    };

    const handleCommitProgress = (data: any) => {
      setCommitProgress({
        count: data.pending_count || 0,
        threshold: data.threshold || commitProgress.threshold,
      });
      setLastUpdate(new Date());
    };

    const handleBufferCreated = () => {
      setBufferStats((prev) => ({
        pending: prev.pending + 1,
        total: Math.max(prev.total + 1, prev.pending + 1),
      }));
      setLastUpdate(new Date());
    };

    const handleBufferReady = () => {
      setLastUpdate(new Date());
    };

    const handleVersionCreated = (data: any) => {
      loadStats();
      setCommitProgress({ count: 0, threshold: commitProgress.threshold });
      setLatestVersion(data.version ?? latestVersion);
      setBufferStats((prev) => ({
        pending: 0,
        total: prev.total,
      }));
      setLastUpdate(new Date());
    };

    wsService.on("pending_rollouts_updated", handleRolloutUpdate);
    wsService.on("queue_updated", handleQueueUpdate);
    wsService.on("commit_progress", handleCommitProgress);
    wsService.on("buffer_created", handleBufferCreated);
    wsService.on("buffer_ready", handleBufferReady);
    wsService.on("version_created", handleVersionCreated);
    refreshEvents.forEach((event) => wsService.on(event, refreshHandler));
    wsService.subscribeDashboard();

    return () => {
      wsService.off("pending_rollouts_updated", handleRolloutUpdate);
      wsService.off("queue_updated", handleQueueUpdate);
      wsService.off("commit_progress", handleCommitProgress);
      wsService.off("buffer_created", handleBufferCreated);
      wsService.off("buffer_ready", handleBufferReady);
      wsService.off("version_created", handleVersionCreated);
      refreshEvents.forEach((event) => wsService.off(event, refreshHandler));
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadStats, loadInitialData, commitProgress.threshold, latestVersion]);

  const handleExportResources = async () => {
    try {
      const result = await exportResources();
      onNotify?.(
        `Resources exported (${result.filename}) for version ${result.version}`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export resources";
      onNotify?.(`Export failed: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-600 shadow-sm">
        Loading statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        No statistics available.
      </div>
    );
  }

  const {
    mode,
    update_cycle,
    pending_rollouts,
    pending_feedback,
    total_jobs,
    gemini_stats,
    knowledge_metrics,
    performance_history,
  } = stats;

  const progressPct =
    ((pendingCount || pending_rollouts) / (maxRollouts || 5)) * 100;

  const queueSummary = [
    { label: "Pending", value: queueStats.pending },
    { label: "Active", value: queueStats.active },
    { label: "Completed", value: queueStats.completed },
  ];

  const insightsSummary = insights?.summary;
  const maxDomainPatterns =
    insights?.domain_distribution && insights.domain_distribution.length > 0
      ? Math.max(...insights.domain_distribution.map((d) => d.patterns))
      : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Learning Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Monitor learning cycles, cost, and knowledge growth.
          </p>
        </div>
      </div>

      {/* Queue Summary & Knowledge Store - 2 cards ngang nhau */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-medium text-slate-600">Queue Summary</h4>
          <div className="text-2xl font-semibold text-slate-900">
            {queueStats.pending}
          </div>
          <p className="text-xs text-slate-500">Pending Jobs</p>
          <div className="mt-2 grid grid-cols-3 text-[11px] text-slate-600">
            {queueSummary.map((item) => (
              <div key={item.label}>
                <p className="font-semibold">{item.value}</p>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-medium text-slate-600">
            Knowledge Store
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {knowledge_metrics.total_patterns}
          </div>
          <p className="text-xs text-slate-500">Learned Patterns</p>
          <p className="text-[11px] text-slate-600">
            Vector Size: {knowledge_metrics.vector_size_mb.toFixed(2)} MB
          </p>
          <p className="text-[11px] text-slate-600">
            Graph Nodes: {knowledge_metrics.graph_nodes}
          </p>
          <p className="text-[11px] text-slate-600">
            Cache Hit Rate:{" "}
            {(knowledge_metrics.cache_hit_rate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-600">
            Commit Progress
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {commitProgress.count}/{commitProgress.threshold}
          </div>
          <p className="text-[11px] text-slate-600">
            {commitProgress.threshold - commitProgress.count > 0
              ? `${commitProgress.threshold - commitProgress.count
              } more needed for next version`
              : "Ready for new version"}
          </p>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${(commitProgress.count / commitProgress.threshold) * 100
                  }%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-600">
            Buffer Status
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {bufferStats.pending}/{bufferStats.total}
          </div>
          <p className="text-[11px] text-slate-600">
            Pending review buffers vs total
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-600">
            Latest Version
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {latestVersion ? `v${latestVersion}` : "N/A"}
          </div>
          <p className="text-[11px] text-slate-600">
            Updated whenever buffers are committed
          </p>
        </div>
      </div>

      {performance_history && performance_history.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Performance Over Time
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performance_history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="cycle"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Update Cycle",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Average Reward",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />
                <Tooltip

                  formatter={(value: any) =>
                    typeof value === "number"
                      ? `${(value * 100).toFixed(1)}%`
                      : value
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg_reward"
                  name="Average Reward"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {insights && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Learning Insights
              </h3>
              <p className="text-xs text-slate-500">
                Snapshot of domains, success rates, and storage metrics.
              </p>
            </div>
            {insightsSummary && (
              <div className="flex gap-4 text-xs text-slate-600">
                <InsightStat label="Patterns" value={insightsSummary.total_patterns} />
                <InsightStat label="Domains" value={insightsSummary.domains_learned} />
                <InsightStat
                  label="Avg Success"
                  value={`${(insightsSummary.avg_success_rate * 100).toFixed(
                    1
                  )}%`}
                />
              </div>
            )}
          </div>

          {insights.domain_expertise && insights.domain_expertise.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-slate-500">
                Top Domains
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                {insights.domain_expertise.slice(0, 5).map((domain, idx) => (
                  <div
                    key={`${domain.domain}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {domain.domain}
                      </p>
                      <p>
                        {domain.pattern_count} patterns •{" "}
                        {(domain.avg_success_rate * 100).toFixed(1)}% success
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {domain.confidence} confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.domain_distribution &&
            insights.domain_distribution.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-500">
                  Pattern Distribution by Domain
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  {insights.domain_distribution.map((domain) => (
                    <div key={domain.domain}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">
                          {domain.domain}
                        </span>
                        <span>{domain.patterns} patterns</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.min(
                              (domain.patterns / maxDomainPatterns) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {insights.success_distribution && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-slate-500">
                Learning Quality Distribution
              </h4>
              <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                {Object.entries(insights.success_distribution).map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-100 px-3 py-2"
                    >
                      <p className="font-semibold capitalize text-slate-900">
                        {label}
                      </p>
                      <p>{value} cycles</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {insights.storage_metrics && (
            <div className="grid gap-3 text-xs text-slate-600 md:grid-cols-3">
              <StorageStat
                label="Vector Size"
                value={`${insights.storage_metrics.vector_size_mb} MB`}
              />
              <StorageStat
                label="Graph Nodes"
                value={insights.storage_metrics.graph_nodes}
              />
              <StorageStat
                label="Stored Patterns"
                value={insights.storage_metrics.total_stored_patterns}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Live updates {lastUpdate ? `• ${lastUpdate.toLocaleTimeString()}` : ""}
        </div>
        <p>
          last synced {lastUpdate ? lastUpdate.toLocaleTimeString() : "recently"}
        </p>
      </div>
    </div>
  );
};

const InsightStat: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-full border border-slate-200 px-3 py-1">
    <span className="font-semibold text-slate-900">{value}</span>{" "}
    <span className="text-slate-500">{label}</span>
  </div>
);

const StorageStat: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
    <p className="text-[11px] font-semibold uppercase text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);
