// src/services/agent-training.service.ts

import { AxiosError } from "axios";
import { trainingAxiosInstance } from "@/config/axios.config";

import type {
  BufferData,
  BufferMetadata,
  CrawlJob,
  CrawlResult,
  FeedbackResponse,
  LearningInsights,
  PendingCommitsStatus,
  QueueStatus,
  QueuedJobResponse,
  TrainingJob,
  TrainingStats,
  VersionHistoryResponse,
  VersionInfo,
} from "@/types/agent-training/training.types";

/**
 * Nếu cần baseURL riêng thì set trong env,
 * còn không thì dùng luôn NEXT_PUBLIC_CRAWL_BASE_URL_API từ trainingAxiosInstance.
 */

const inFlightRequests = new Map<string, Promise<any>>();

const withDedupe = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const request = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, request);
  return request;
};

const handleAxiosError = (error: AxiosError) => {
  if (
    error.code === AxiosError.ERR_CANCELED ||
    error.name === "CanceledError" ||
    (error as any)?.__CANCEL__
  ) {
    // Surface cancellations so callers can gracefully ignore them.
    throw error;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Training API Error:", error);
  }

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as { message?: string; detail?: string };

    switch (status) {
      case 400:
        throw new Error(data?.message || data?.detail || "Invalid request");
      case 401:
        throw new Error("Unauthorized - please login again");
      case 403:
        throw new Error("Access forbidden");
      case 404:
        throw new Error("Resource not found");
      case 422:
        throw new Error(data?.message || data?.detail || "Validation error");
      case 429:
        throw new Error("Too many requests - please try again later");
      case 500:
        throw new Error("Server error - please try again later");
      case 503:
        throw new Error("Service unavailable - please try again later");
      default:
        throw new Error(
          data?.message ||
            data?.detail ||
            `Request failed with status ${status}`
        );
    }
  } else if (error.request) {
    throw new Error("Network error - please check your connection");
  } else {
    throw new Error(error.message || "Request failed");
  }
};

export const trainingApi = {
  // Health check
  async healthCheck() {
    try {
      const response = await trainingAxiosInstance.get("/health");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Submit training crawl
  async submitCrawl(job: CrawlJob): Promise<CrawlResult | QueuedJobResponse> {
    try {
      const response = await trainingAxiosInstance.post("/train-crawl", job);
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Submit feedback
  async submitFeedback(
    jobId: string,
    feedback: string
  ): Promise<FeedbackResponse> {
    try {
      const response = await trainingAxiosInstance.post("/feedback", {
        job_id: jobId,
        feedback,
      });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Get training stats
  async getStats(signal?: AbortSignal): Promise<TrainingStats> {
    return withDedupe("stats", async () => {
      try {
        const response = await trainingAxiosInstance.get("/stats", { signal });
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  // Get learned patterns
  async getPatterns() {
    try {
      const response = await trainingAxiosInstance.get("/knowledge/patterns");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Trigger consolidation
  async triggerConsolidation() {
    try {
      const response = await trainingAxiosInstance.post(
        "/knowledge/consolidate"
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Get RL policy
  async getRLPolicy() {
    try {
      const response = await trainingAxiosInstance.get("/rl/policy");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Learning insights - AI knowledge summary
  async getLearningInsights(signal?: AbortSignal): Promise<LearningInsights> {
    return withDedupe("learning_insights", async () => {
      try {
        const response = await trainingAxiosInstance.get(
          "/knowledge/insights",
          { signal }
        );
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  // Queue endpoints
  async getQueueStatus(): Promise<QueueStatus> {
    return withDedupe("queue_status", async () => {
      try {
        const response = await trainingAxiosInstance.get("/queue/status");
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  async getPendingJobs(): Promise<TrainingJob[]> {
    try {
      const response = await trainingAxiosInstance.get("/queue/pending");
      return response.data?.pending_jobs || [];
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Buffer endpoints
  async listBuffers(): Promise<BufferMetadata[]> {
    return withDedupe("buffers_list", async () => {
      try {
        const response = await trainingAxiosInstance.get("/buffers/list");
        return response.data?.buffers || [];
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  async getPendingBuffers(): Promise<BufferMetadata[]> {
    return withDedupe("buffers_pending", async () => {
      try {
        const response = await trainingAxiosInstance.get("/buffers/pending");
        return response.data?.pending_buffers || [];
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  async getBuffer(jobId: string, adminId = "admin"): Promise<BufferData> {
    try {
      const response = await trainingAxiosInstance.get(`/buffer/${jobId}`, {
        params: { admin_id: adminId },
      });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  async commitTraining(
    jobId: string,
    adminId: string,
    feedback?: string
  ): Promise<{
    status: "pending" | "version_created";
    version?: number;
    message: string;
    pending_count?: number;
    commits_needed?: number;
    commit_count?: number;
  }> {
    try {
      const response = await trainingAxiosInstance.post(
        `/commit-training/${jobId}`,
        {
          admin_id: adminId,
          feedback,
        }
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  async getPendingCommitsStatus(): Promise<PendingCommitsStatus> {
    return withDedupe("pending_commits_status", async () => {
      try {
        const response = await trainingAxiosInstance.get(
          "/pending-commits/status"
        );
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  async discardBuffer(
    jobId: string,
    adminId = "admin"
  ): Promise<{ message: string }> {
    try {
      const response = await trainingAxiosInstance.delete(
        `/buffer/${jobId}`,
        {
          params: { admin_id: adminId },
        }
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // Versions
  async getVersionHistory(): Promise<VersionHistoryResponse> {
    return withDedupe("versions_history", async () => {
      try {
        const response = await trainingAxiosInstance.get("/versions/history");
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  async submitNegativeFeedback(
    jobId: string,
    adminId: string,
    feedback: string
  ): Promise<{
    status: string;
    job_id: string;
    message: string;
    feedback: string;
    next_action: string;
  }> {
    try {
      const response = await trainingAxiosInstance.post(
        `/buffer/${jobId}/negative-feedback`,
        null,
        {
          params: { admin_id: adminId, feedback },
        }
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  async exportResources(): Promise<{
    filename: string;
    version: number;
    domain_patterns_count?: number;
    total_cycles?: number;
  }> {
    try {
      const response = await trainingAxiosInstance.post("/export/resources");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },
};

export default trainingApi;

export type TrainingApi = typeof trainingApi;
