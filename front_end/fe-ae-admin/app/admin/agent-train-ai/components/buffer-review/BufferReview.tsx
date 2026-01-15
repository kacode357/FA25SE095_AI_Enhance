"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import wsService from "@/services/agent-training.websocket";
import { trainingApi } from "@/services/agent-training.service";
import { loadDecodedUser } from "@/utils/secure-user";
import {
  BufferActionButtons,
  BufferActionButton,
} from "./BufferActionButtons";
import { BufferCommitFeedbackDialog } from "./BufferCommitFeedbackDialog";
import { BufferNegativeExampleDialog } from "./BufferConfirmDialog";
import { BufferConfirmationDialog } from "./BufferConfirmationDialog";
import { BufferDetailsDialog } from "./BufferDetailsDialog";
import { InfoRow, MetricCard } from "./BufferInfoElements";
import type {
  BufferData,
  BufferMetadata,
  PendingCommitsStatus,
  VersionInfo,
  WebSocketMessageType,
} from "@/types/agent-training/training.types";

interface BufferReviewCache {
  buffers: BufferMetadata[];
  pendingCommits: PendingCommitsStatus;
}

const BUFFER_CACHE_KEY = "__ae_buffer_review_cache__";
const VERSION_CACHE_KEY = "__ae_version_history_cache__";

const getBufferCache = (): BufferReviewCache | null =>
  (globalThis as Record<string, any>)[BUFFER_CACHE_KEY] || null;

const setBufferCache = (data: BufferReviewCache | null) => {
  (globalThis as Record<string, any>)[BUFFER_CACHE_KEY] = data;
};

const setVersionCache = (data: VersionInfo[] | null) => {
  (globalThis as Record<string, any>)[VERSION_CACHE_KEY] = data;
};

interface BufferReviewProps {
  onCommit?: (jobId: string, version?: number) => void;
  onDiscard?: (jobId: string) => void;
  onNotify?: (message: string) => void;
  getPendingBuffers: () => Promise<BufferMetadata[]>;
  getPendingCommitsStatus: () => Promise<PendingCommitsStatus>;
  getBuffer: (jobId: string, adminId?: string) => Promise<BufferData>;
  commitTraining: (
    jobId: string,
    adminId: string,
    feedback?: string
  ) => Promise<{
    status: "pending" | "version_created";
    version?: number;
    message: string;
  }>;
  submitNegativeFeedback: (
    jobId: string,
    adminId: string,
    feedback: string
  ) => Promise<{ message: string }>;
  discardBuffer: (
    jobId: string,
    adminId?: string
  ) => Promise<{ message: string }>;
  initialBuffers?: BufferMetadata[];
  initialPendingCommits?: PendingCommitsStatus | null;
}

const DEFAULT_PENDING_COMMITS: PendingCommitsStatus = {
  pending_count: 0,
  commits_needed: 5,
  threshold: 5,
  ready_for_version: false,
};

export const BufferReview: React.FC<BufferReviewProps> = ({
  onCommit,
  onDiscard,
  onNotify,
  getPendingBuffers,
  getPendingCommitsStatus,
  getBuffer,
  commitTraining,
  submitNegativeFeedback,
  discardBuffer,
  initialBuffers,
  initialPendingCommits,
}) => {
  const [buffers, setBuffers] = useState<BufferMetadata[]>([]);
  const [selectedBuffer, setSelectedBuffer] = useState<BufferData | null>(null);
  const [detailJobId, setDetailJobId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    jobId: string;
    feedback: string;
  } | null>(null);
  const [negativeFeedbackModal, setNegativeFeedbackModal] = useState<{
    jobId: string;
    feedback: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<{
    jobId: string;
    type: "commit" | "discard";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string>("");
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [pendingCommits, setPendingCommits] = useState<PendingCommitsStatus>(
    DEFAULT_PENDING_COMMITS
  );
  const readinessTriggeredRef = useRef(false);
  const syncVersionHistoryCache = useCallback(async () => {
    try {
      const data = await trainingApi.getVersionHistory();
      setVersionCache(data.versions || []);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to refresh version history", err);
      }
    }
  }, []);
  useEffect(() => {
    let isMounted = true;
    const bootstrapUser = async () => {
      try {
        const user = await loadDecodedUser();
        if (isMounted && user?.id) {
          setAdminId(user.id);
        }
      } catch {
        // ignored
      }
    };
    bootstrapUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchBuffers = useCallback(
    async (options?: { initial?: boolean }) => {
      const isInitial = options?.initial ?? false;
      if (isInitial) {
        setLoading(true);
      }

      try {
        setError(null);
        const bufferList = await getPendingBuffers();
        const commitStatus = await getPendingCommitsStatus();
        const toCache = {
          buffers: bufferList,
          pendingCommits: commitStatus,
        };
        setBuffers(bufferList);
        setPendingCommits(commitStatus);
        setBufferCache(toCache);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load buffers";
        setError(message);
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
      },
      [
        getPendingBuffers,
        getPendingCommitsStatus,
      ]
    );

  useEffect(() => {
      const cached = getBufferCache();
      if (cached) {
        setBuffers(cached.buffers);
        setPendingCommits(cached.pendingCommits);
        setLoading(false);
        return;
      }
      if (initialBuffers !== undefined && initialPendingCommits) {
        setBuffers(initialBuffers);
        setPendingCommits(initialPendingCommits);
        setBufferCache({
          buffers: initialBuffers,
          pendingCommits: initialPendingCommits,
        });
        setLoading(false);
        return;
      }
      fetchBuffers({ initial: true });
    }, [fetchBuffers, initialBuffers, initialPendingCommits]);

  useEffect(() => {
    const bufferEvents: WebSocketMessageType[] = [
      "training_completed",
      "training_failed",
      "buffer_created",
      "buffer_ready",
      "version_committed",
      "version_created",
      "buffer_discarded",
      "commit_progress",
    ];

    const handleBufferUpdate = () => fetchBuffers();
    bufferEvents.forEach((event) => wsService.on(event, handleBufferUpdate));

    return () => {
      bufferEvents.forEach((event) => wsService.off(event, handleBufferUpdate));
    };
  }, [fetchBuffers]);

  const resolveAdminId = useCallback(
    (bufferAdminId?: string) => bufferAdminId || adminId || "admin",
    [adminId]
  );

  const handleViewBuffer = async (jobId: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedBuffer(null);
    setDetailJobId(jobId);
    try {
      const targetBuffer = buffers.find((buffer) => buffer.job_id === jobId);
      const bufferData = await getBuffer(
        jobId,
        resolveAdminId(targetBuffer?.admin_id)
      );
      setSelectedBuffer(bufferData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch buffer details";
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedBuffer(null);
    setDetailError(null);
    setDetailJobId(null);
  };

  const handleCommit = async (jobId: string, feedback?: string) => {
    setProcessingJobId(jobId);
    try {
      const targetBuffer = buffers.find((buffer) => buffer.job_id === jobId);
      const bufferAdminId = resolveAdminId(targetBuffer?.admin_id);

      const result = await commitTraining(jobId, bufferAdminId, feedback);

      onNotify?.(result.message);
      if (result.status === "version_created") {
        onCommit?.(jobId, result.version);
        syncVersionHistoryCache();
      }

      await fetchBuffers();
      if (selectedBuffer?.job_id === jobId) {
        setSelectedBuffer(null);
        setDetailModalOpen(false);
        setDetailJobId(null);
      }
      setFeedbackModal(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to commit training";
      setError(message);
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleCommitWithFeedback = (jobId: string) => {
    setFeedbackModal({ jobId, feedback: "" });
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModal || !feedbackModal.feedback.trim()) {
      return;
    }
    await handleCommit(feedbackModal.jobId, feedbackModal.feedback.trim());
  };

  const handleNegativeFeedback = async (jobId: string, feedback: string) => {
    const trimmed = feedback.trim();
    if (!trimmed) return;
    setProcessingJobId(jobId);
    try {
      const targetBuffer = buffers.find((buffer) => buffer.job_id === jobId);
      const bufferAdminId = resolveAdminId(targetBuffer?.admin_id);
      const result = await submitNegativeFeedback(
        jobId,
        bufferAdminId,
        trimmed
      );
      onNotify?.(result.message);
      await fetchBuffers();
      setNegativeFeedbackModal(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit feedback";
      setError(message);
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleSubmitNegativeFeedback = async () => {
    if (
      !negativeFeedbackModal ||
      !negativeFeedbackModal.feedback.trim()
    ) {
      return;
    }
    await handleNegativeFeedback(
      negativeFeedbackModal.jobId,
      negativeFeedbackModal.feedback
    );
  };

  const handleConfirmAction = async () => {
    if (!confirmation) return;
    const { jobId, type } = confirmation;
    setConfirmation(null);
    if (type === "commit") {
      await handleCommit(jobId);
    } else {
      await handleDiscard(jobId);
    }
  };

  const handleDiscard = async (jobId: string) => {
    setProcessingJobId(jobId);
    try {
      const targetBuffer = buffers.find((buffer) => buffer.job_id === jobId);
      const bufferAdminId = resolveAdminId(targetBuffer?.admin_id);
      const result = await discardBuffer(jobId, bufferAdminId);
      onNotify?.(result.message);
      onDiscard?.(jobId);
      await fetchBuffers();
      if (selectedBuffer?.job_id === jobId) {
        setSelectedBuffer(null);
        setDetailModalOpen(false);
        setDetailJobId(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to discard buffer";
      setError(message);
    } finally {
      setProcessingJobId(null);
    }
  };

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString();

  const pendingIndicator = useMemo(() => {
    const pct =
      (pendingCommits.pending_count / (pendingCommits.threshold || 5)) * 100;
    return {
      pct: Math.min(pct, 100),
      ready: pendingCommits.ready_for_version,
    };
  }, [pendingCommits]);

  useEffect(() => {
    const threshold = pendingCommits.threshold || 0;
    const ready =
      threshold > 0 && pendingCommits.pending_count >= threshold;
    if (ready && !readinessTriggeredRef.current) {
      readinessTriggeredRef.current = true;
      syncVersionHistoryCache();
    } else if (!ready) {
      readinessTriggeredRef.current = false;
    }
  }, [pendingCommits, syncVersionHistoryCache]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-600">
        Loading buffers...
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
          onClick={() => fetchBuffers()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Pattern Buffers ({buffers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Review pending crawl results before promoting.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-600">
              Pending Commits
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {pendingCommits.pending_count}/{pendingCommits.threshold}
            </p>
            <p className="text-xs text-slate-500">
              {pendingCommits.commits_needed > 0
                ? `${pendingCommits.commits_needed} more needed for new version`
                : "Ready to create version"}
            </p>
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  pendingIndicator.ready ? "bg-emerald-500" : "bg-indigo-500"
                }`}
                style={{ width: `${pendingIndicator.pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {buffers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          No pending buffers to review.
        </div>
      ) : (
        <div className="space-y-4">
          {buffers.map((buffer) => {
            const detailLoadingForJob =
              detailModalOpen &&
              detailLoading &&
              detailJobId === buffer.job_id;
            return (
              <div
                key={buffer.job_id}
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Pending pattern buffer
                    </p>
                    <p className="text-xs text-slate-500">
                      {buffer.patterns_count} learned patterns
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    Expires in {buffer.ttl_hours}h
                  </span>
                </div>

                <dl className="grid gap-2 text-xs text-slate-600">
                  <InfoRow
                    label="URL"
                    value={
                      <a
                        href={buffer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-indigo-600 hover:underline"
                      >
                        {buffer.url}
                      </a>
                    }
                  />
                  <InfoRow label="Details" value={buffer.description} />
                  <InfoRow
                    label="Created"
                    value={formatTimestamp(buffer.timestamp)}
                  />
                </dl>

                <div className="flex flex-wrap gap-2">
                  <BufferActionButton
                    label="View details"
                    onClick={() => handleViewBuffer(buffer.job_id)}
                    disabled={processingJobId === buffer.job_id}
                  />
                  <BufferActionButtons
                    jobId={buffer.job_id}
                    onCommit={(jobId) =>
                      setConfirmation({
                        jobId,
                        type: "commit",
                      })
                    }
                    onCommitWithFeedback={handleCommitWithFeedback}
                    onNegativeExample={(jobId) =>
                      setNegativeFeedbackModal({
                        jobId,
                        feedback: "",
                      })
                    }
                    onDiscard={(jobId) =>
                      setConfirmation({
                        jobId,
                        type: "discard",
                      })
                    }
                    isLoading={processingJobId === buffer.job_id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BufferDetailsDialog
        open={detailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDetailModal();
          } else {
            setDetailModalOpen(true);
          }
        }}
        buffer={selectedBuffer}
        loading={detailLoading}
        error={detailError}
        formatTimestamp={formatTimestamp}
      />

      <BufferCommitFeedbackDialog
        open={Boolean(feedbackModal)}
        onOpenChange={(open) => {
          if (!open) {
            setFeedbackModal(null);
          }
        }}
        feedback={feedbackModal?.feedback ?? ""}
        onFeedbackChange={(feedback) =>
          feedbackModal &&
          setFeedbackModal({
            ...feedbackModal,
            feedback,
          })
        }
        onSubmit={handleSubmitFeedback}
        isLoading={processingJobId === feedbackModal?.jobId}
      />

      <BufferNegativeExampleDialog
        open={Boolean(negativeFeedbackModal)}
        onOpenChange={(open) => {
          if (!open) {
            setNegativeFeedbackModal(null);
          }
        }}
        feedback={negativeFeedbackModal?.feedback ?? ""}
        onFeedbackChange={(feedback) =>
          negativeFeedbackModal &&
          setNegativeFeedbackModal({
            ...negativeFeedbackModal,
            feedback,
          })
        }
        onSubmit={handleSubmitNegativeFeedback}
        isLoading={processingJobId === negativeFeedbackModal?.jobId}
      />

      <BufferConfirmationDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
        type={confirmation?.type ?? "commit"}
        onConfirm={handleConfirmAction}
        isLoading={processingJobId === confirmation?.jobId}
      />
    </div>
  );
};
