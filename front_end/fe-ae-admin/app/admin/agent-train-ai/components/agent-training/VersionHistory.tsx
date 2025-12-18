"use client";

import React, { useCallback, useEffect, useState } from "react";

import wsService from "@/services/agent-training.websocket";
import type { VersionInfo } from "@/types/agent-training/training.types";

const VERSION_CACHE_KEY = "__ae_version_history_cache__";

const getVersionCache = (): VersionInfo[] | null =>
  (globalThis as Record<string, any>)[VERSION_CACHE_KEY] || null;

const setVersionCache = (data: VersionInfo[] | null) => {
  (globalThis as Record<string, any>)[VERSION_CACHE_KEY] = data;
};

interface VersionHistoryResponseData {
  current_version?: number;
  total_versions?: number;
  versions: VersionInfo[];
}

interface VersionHistoryProps {
  getVersionHistory: () => Promise<VersionHistoryResponseData>;
  initialData?: VersionHistoryResponseData | null;
  onNotify?: (message: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  getVersionHistory,
  initialData,
  onNotify,
}) => {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalVersions: number;
    latestVersion: string;
    latestPatterns: number;
  }>({
    totalVersions: 0,
    latestVersion: "—",
    latestPatterns: 0,
  });

  const toNumber = (value?: number | string) => {
    if (value === null || value === undefined) return undefined;
    const num = typeof value === "number" ? value : Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const sortVersions = useCallback(
    (list: VersionInfo[] = []) => {
      return [...list].sort((a, b) => {
        const verA = toNumber(a.version) ?? 0;
        const verB = toNumber(b.version) ?? 0;
        if (verA !== verB) {
          return verB - verA;
        }
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    },
    [/* no deps */]
  );

  const computeSummary = useCallback(
    (data: VersionHistoryResponseData | { versions: VersionInfo[] }) => {
      const versionList = sortVersions(data.versions || []);
      const totalRaw =
        "total_versions" in data ? data.total_versions : undefined;
      const total =
        toNumber(totalRaw) ?? versionList.length;
      const latest = versionList[0];
      const latestRaw =
        "current_version" in data && data.current_version !== undefined
          ? data.current_version
          : latest?.version;
      const latestVersion =
        latestRaw !== undefined && latestRaw !== null
          ? `v${latestRaw}`
          : "—";
      const latestPatterns =
        toNumber(latest?.total_patterns ?? latest?.patterns_count) ?? 0;

      return {
        totalVersions: total,
        latestVersion,
        latestPatterns,
      };
    },
    [sortVersions]
  );

  const fetchVersions = useCallback(
    async (options?: { initial?: boolean }) => {
      const isInitial = options?.initial ?? false;
      if (isInitial) {
        setLoading(true);
      }
      try {
        setError(null);
        const response = await getVersionHistory();
        const ordered = sortVersions(response.versions);
        setVersionCache(ordered);
        setVersions(ordered);
        setSummary(computeSummary({ ...response, versions: ordered }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load version history";
        setError(message);
      } finally {
        setLoading(false);
      }
      },
      [getVersionHistory]
    );

  useEffect(() => {
        const cached = getVersionCache();
        if (cached) {
          const orderedCached = sortVersions(cached);
          setVersions(orderedCached);
          setSummary(computeSummary({ versions: orderedCached }));
          setLoading(false);
          return;
        }
        if (initialData) {
          const orderedInitial = sortVersions(initialData.versions || []);
          setVersions(orderedInitial);
          setVersionCache(orderedInitial);
          setSummary(
            computeSummary({ ...initialData, versions: orderedInitial })
          );
          setLoading(false);
          return;
        }
        fetchVersions({ initial: true });
      },
      [computeSummary, fetchVersions, initialData, sortVersions]
    );

  useEffect(() => {
    const handleVersionUpdate = () => {
      fetchVersions();
    };
    wsService.on("version_committed", handleVersionUpdate);
    return () => {
      wsService.off("version_committed", handleVersionUpdate);
    };
  }, [fetchVersions]);

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString();

  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-600">
        Loading version history...
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
          onClick={() => fetchVersions()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
        No version history yet. Commit buffers to create a release.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            AI Version History
          </h2>
          <p className="text-xs text-slate-500">
            Review each release created after training buffers are committed.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
          onClick={() => {
            fetchVersions();
            onNotify?.("Version history refreshed");
          }}
        >
          Refresh
        </button>
      </div>

      <div className="relative space-y-4 before:absolute before:bottom-0 before:left-4 before:top-2 before:w-px before:bg-slate-200">
        {versions.map((version) => (
          <div key={version.version} className="relative pl-10">
            <span className="absolute left-0 top-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              v{version.version}
            </span>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{formatTimestamp(version.timestamp)}</span>
                <span>{formatRelativeTime(version.timestamp)}</span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                <VersionStat
                  label="Commits"
                  value={
                    toNumber(version.commit_count)?.toLocaleString() ?? "—"
                  }
                />
                <VersionStat
                  label="Domains"
                  value={
                    toNumber(version.total_domains)?.toLocaleString() ?? "—"
                  }
                />
                <VersionStat
                  label="Patterns"
                  value={
                    toNumber(
                      version.total_patterns ?? version.patterns_count
                    )?.toLocaleString() ?? "—"
                  }
                />
              </div>
              {version.is_latest && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Currently deployed
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total versions"
          value={summary.totalVersions.toLocaleString()}
        />
        <SummaryCard label="Latest version" value={summary.latestVersion} />
        <SummaryCard
          label="Patterns in latest release"
          value={summary.latestPatterns.toLocaleString()}
        />
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

const VersionStat: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
    <p className="text-[11px] font-semibold uppercase text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
  </div>
);
