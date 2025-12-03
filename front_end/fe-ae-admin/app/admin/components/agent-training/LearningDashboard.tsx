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

import type {
  TrainingStats,
  PendingRolloutsUpdate,
} from "@/types/agent-training/training.types";
import { trainingApi } from "@/services/agent-training.service";
import wsService from "@/services/agent-training.websocket";

const STATS_REFRESH_INTERVAL = 5000;

export const LearningDashboard: React.FC = () => {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [maxRollouts, setMaxRollouts] = useState<number>(5);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef: MutableRefObject<boolean> = useRef(false);

  const loadStats = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const data = await trainingApi.getStats(
        abortControllerRef.current.signal
      );
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
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadStats();

    const interval = setInterval(() => {
      loadStats();
    }, STATS_REFRESH_INTERVAL);

    const handleRolloutUpdate = (data: any) => {
      const update = data as PendingRolloutsUpdate;
      setPendingCount(update.pending_count);
      setMaxRollouts(update.update_frequency);
      setCurrentCycle(update.cycle);
    };

    wsService.on("pending_rollouts_updated", handleRolloutUpdate);

    return () => {
      clearInterval(interval);
      wsService.off("pending_rollouts_updated", handleRolloutUpdate);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadStats]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Learning Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Monitor learning cycles, cost, and knowledge growth.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
          {mode} MODE
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-medium text-slate-600">
            Training Progress
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {currentCycle || update_cycle}
          </div>
          <p className="text-xs text-slate-500">Update Cycles</p>
          <div className="mt-3 space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600">
              Pending Rollouts: {pendingCount || pending_rollouts} /{" "}
              {maxRollouts || 5}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-medium text-slate-600">
            Jobs & Feedback
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {total_jobs}
          </div>
          <p className="text-xs text-slate-500">Total Jobs</p>
          <p className="text-[11px] text-slate-600">
            Awaiting Feedback: {pending_feedback}
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-medium text-slate-600">
            Gemini API Usage
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            {gemini_stats.gemini_calls}
          </div>
          <p className="text-xs text-slate-500">Total API Calls</p>
          <p className="text-[11px] text-slate-600">
            Cache Hit Rate:{" "}
            {(gemini_stats.cache_hit_rate * 100).toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-600">
            Local LLM Calls: {gemini_stats.local_llm_calls}
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-medium text-slate-600">
            Cost Optimization
          </h4>
          <div className="text-2xl font-semibold text-slate-900">
            ${gemini_stats.estimated_cost_usd.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500">Estimated Cost</p>
          <p className="text-[11px] text-emerald-700">
            Saved: ${gemini_stats.estimated_savings_usd.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-600">
            Batched Requests: {gemini_stats.batched_requests}
          </p>
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
                  formatter={(value: number) =>
                    (value * 100).toFixed(1) + "%"
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

      <div className="flex justify-end text-[11px] text-slate-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
