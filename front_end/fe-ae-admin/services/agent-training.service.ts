// src/services/agent-training.service.ts

import { AxiosError } from "axios";
import { trainingAxiosInstance } from "@/config/axios.config";

import type {
  CrawlJob,
  CrawlResult,
  FeedbackResponse,
  TrainingStats,
} from "@/types/agent-training/training.types";

/**
 * Nếu cần baseURL riêng thì set trong env,
 * còn không thì dùng luôn NEXT_PUBLIC_CRAWL_BASE_URL_API từ trainingAxiosInstance.
 */

const handleAxiosError = (error: AxiosError) => {
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
  async submitCrawl(job: CrawlJob): Promise<CrawlResult> {
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
    try {
      const response = await trainingAxiosInstance.get("/stats", { signal });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
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
};

export default trainingApi;
