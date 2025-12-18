"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { SubmitTrainingPanel } from "@/app/admin/agent-train-ai/components/agent-training/SubmitTrainingPanel";
import { BufferReview } from "@/app/admin/agent-train-ai/components/buffer-review/BufferReview";
import { QueueMonitor } from "@/app/admin/agent-train-ai/components/agent-training/QueueMonitor";
import { VersionHistory } from "@/app/admin/agent-train-ai/components/agent-training/VersionHistory";
import { LearningDashboard } from "@/app/admin/agent-train-ai/components/agent-training/LearningDashboard";
import { useAgentTrainingHub } from "@/contexts/agent-training-hub-context";
import { useTrainingApi } from "@/hooks/agent-training/useTrainingApi";
import type {
  BufferMetadata,
  LearningInsights,
  PendingCommitsStatus,
  QueueStatus,
  TrainingStats,
  VersionHistoryResponse,
} from "@/types/agent-training/training.types";

type TabId =
  | "submit"
  | "queue"
  | "buffer"
  | "versions"
  | "dashboard";

interface TabConfig {
  id: TabId;
  label: string;
  description: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: "submit",
    label: "Submit Training",
    description: "Launch new crawl jobs and capture feedback.",
  },
  {
    id: "queue",
    label: "Queue Monitor",
    description: "Track pending and active jobs in real time.",
  },
  {
    id: "buffer",
    label: "Buffer Review",
    description: "Promote or discard completed training buffers.",
  },
  {
    id: "versions",
    label: "Version History",
    description: "Inspect agent releases and pattern counts.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Visualize learning insights and usage trends.",
  },
];

const AgentTrainingIndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("submit");
  const [mountedTabs, setMountedTabs] = useState<TabId[]>(["submit"]);
  const { wsConnected, addNotification } = useAgentTrainingHub();
  const trainingApi = useTrainingApi();
  const [initialQueueStatus, setInitialQueueStatus] = useState<QueueStatus | null>(null);
  const [initialPendingCommits, setInitialPendingCommits] = useState<PendingCommitsStatus | null>(null);
  const [initialPendingBuffers, setInitialPendingBuffers] = useState<BufferMetadata[] | undefined>(undefined);
  const [initialAllBuffers, setInitialAllBuffers] = useState<BufferMetadata[] | undefined>(undefined);
  const [initialStats, setInitialStats] = useState<TrainingStats | null>(null);
  const [initialVersionHistory, setInitialVersionHistory] = useState<VersionHistoryResponse | null>(null);
  const [initialInsights, setInitialInsights] = useState<LearningInsights | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapProgress, setBootstrapProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Preparing training workspace...");
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const currentTab = useMemo(
    () => TAB_CONFIG.find((tab) => tab.id === activeTab) ?? TAB_CONFIG[0],
    [activeTab]
  );

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    TAB_CONFIG.slice(1).forEach((tab, idx) => {
      const timer = setTimeout(() => {
        setMountedTabs((prev) =>
          prev.includes(tab.id) ? prev : [...prev, tab.id]
        );
      }, (idx + 1) * 500);
      timers.push(timer);
    });
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const statsAbortController = new AbortController();
    const totalSteps = 8;
    let completedSteps = 0;

    const resetInitialData = () => {
      setInitialQueueStatus(null);
      setInitialPendingCommits(null);
      setInitialPendingBuffers(undefined);
      setInitialAllBuffers(undefined);
      setInitialStats(null);
      setInitialVersionHistory(null);
      setInitialInsights(null);
    };

    const updateProgress = () => {
      if (!isMounted) return;
      const pct = Math.round((completedSteps / totalSteps) * 100);
      setBootstrapProgress(pct);
    };

    const bootstrapData = async () => {
      if (!isMounted) {
        return;
      }
      setBootstrapping(true);
      setBootstrapError(null);
      setBootstrapProgress(0);
      setLoadingMessage("Preparing training workspace...");
      resetInitialData();

      try {
        setLoadingMessage("Checking training API health...");
        await trainingApi.healthCheck();
        if (!isMounted) return;
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Syncing training statistics...");
        const stats = await trainingApi.getStats(statsAbortController.signal);
        if (!isMounted) return;
        setInitialStats(stats);
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Fetching queue status...");
        const queue = await trainingApi.getQueueStatus();
        if (!isMounted) return;
        setInitialQueueStatus(queue);
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Updating commit progress...");
        const commits = await trainingApi.getPendingCommitsStatus();
        if (!isMounted) return;
        setInitialPendingCommits(commits);
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Loading pending buffers...");
        const pendingBuffers = await trainingApi.getPendingBuffers();
        if (!isMounted) return;
        setInitialPendingBuffers(pendingBuffers);
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Collecting buffer catalog...");
        const allBuffers = await trainingApi.listBuffers();
        if (!isMounted) return;
        setInitialAllBuffers(allBuffers);
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Reading version history...");
        const versionHistory = await trainingApi.getVersionHistory();
        if (!isMounted) return;
        setInitialVersionHistory(versionHistory);
        completedSteps += 1;
        updateProgress();

        setLoadingMessage("Gathering learning insights...");
        const insights = await trainingApi.getLearningInsights();
        if (!isMounted) return;
        setInitialInsights(insights);
        completedSteps += 1;
        updateProgress();

        if (!isMounted) return;
        setLoadingMessage("Agent training workspace ready");
        setBootstrapping(false);
        setBootstrapProgress(100);
      } catch (error) {
        if (!isMounted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to prepare agent training workspace";
        setBootstrapError(message);
        setBootstrapping(false);
      }
    };

    bootstrapData();

    return () => {
      isMounted = false;
      statsAbortController.abort();
    };
  }, [trainingApi, bootstrapAttempt]);

  const handleRetryBootstrap = useCallback(() => {
    setBootstrapAttempt((prev) => prev + 1);
  }, []);

  const renderTabContent = useCallback(
    (tabId: TabId) => {
      switch (tabId) {
        case "submit":
          return (
            <SubmitTrainingPanel
              submitCrawl={trainingApi.submitCrawl}
              submitFeedback={trainingApi.submitFeedback}
              onNotify={addNotification}
            />
          );
        case "queue":
          return (
            <QueueMonitor
              getQueueStatus={trainingApi.getQueueStatus}
              initialQueueStatus={initialQueueStatus}
              onNotify={addNotification}
            />
          );
        case "buffer":
          return (
            <BufferReview
              getPendingBuffers={trainingApi.getPendingBuffers}
              getPendingCommitsStatus={trainingApi.getPendingCommitsStatus}
              getBuffer={trainingApi.getBuffer}
              commitTraining={trainingApi.commitTraining}
              submitNegativeFeedback={trainingApi.submitNegativeFeedback}
              discardBuffer={trainingApi.discardBuffer}
              onNotify={addNotification}
              initialBuffers={initialPendingBuffers}
              initialPendingCommits={initialPendingCommits}
            />
          );
        case "versions":
          return (
            <VersionHistory
              getVersionHistory={trainingApi.getVersionHistory}
              onNotify={addNotification}
              initialData={initialVersionHistory ?? null}
            />
          );
        case "dashboard":
          return (
            <LearningDashboard
              getStats={trainingApi.getStats}
              getQueueStatus={trainingApi.getQueueStatus}
              getPendingCommitsStatus={trainingApi.getPendingCommitsStatus}
              listBuffers={trainingApi.listBuffers}
              getPendingBuffers={trainingApi.getPendingBuffers}
              getVersionHistory={trainingApi.getVersionHistory}
              getLearningInsights={trainingApi.getLearningInsights}
              exportResources={trainingApi.exportResources}
              onNotify={addNotification}
              initialStats={initialStats}
              initialQueueStatus={initialQueueStatus}
              initialCommitStatus={initialPendingCommits}
              initialAllBuffers={initialAllBuffers}
              initialPendingBuffers={initialPendingBuffers}
              initialVersionHistory={initialVersionHistory}
              initialInsights={initialInsights}
            />
          );
        default:
          return null;
      }
    },
    [
      addNotification,
      initialAllBuffers,
      initialInsights,
      initialPendingBuffers,
      initialPendingCommits,
      initialQueueStatus,
      initialStats,
      initialVersionHistory,
      trainingApi,
    ]
  );

  if (bootstrapping) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Initializing agent training studio
            </p>
            <p className="mt-1 text-xs text-slate-500">{loadingMessage}</p>
          </div>
          <Progress value={bootstrapProgress} className="h-2 w-full" />
          <p className="text-[11px] font-medium text-slate-500">
            {bootstrapProgress}% complete
          </p>
        </div>
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg space-y-4 rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-xl">
          <p className="text-base font-semibold text-rose-700">
            Unable to load training workspace
          </p>
          <p className="text-sm text-rose-600">{bootstrapError}</p>
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleRetryBootstrap}
              className="rounded-full bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
            >
              Retry loading
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-slate-300"
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Workspace Tabs
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Switch between training tools without leaving the page.
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-semibold shadow-sm ${
              wsConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`mr-2 h-2 w-2 rounded-full ${
                wsConnected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {wsConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto no-scrollbar">
          <div className="inline-flex gap-3 rounded-[28px] border border-[var(--border)] bg-white p-2 shadow-sm">
            {TAB_CONFIG.map((tab) => {
              const isActive = tab.id === currentTab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-[170px] flex-col rounded-[24px] border px-5 py-3 text-left transition ${
                    isActive
                      ? "border-[color-mix(in_oklab,_var(--brand)_50%,_#ffffff)] bg-white text-[var(--foreground)] shadow-md shadow-indigo-100"
                      : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="text-sm font-semibold">{tab.label}</span>
                  <span className="mt-1 text-[11px] leading-snug">
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {TAB_CONFIG.map((tab) => {
          if (!mountedTabs.includes(tab.id)) {
            return null;
          }
          const isActive = tab.id === currentTab.id;
          return (
            <div
              key={tab.id}
              className={isActive ? "block" : "hidden"}
              aria-hidden={!isActive}
            >
              {renderTabContent(tab.id)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentTrainingIndexPage;
