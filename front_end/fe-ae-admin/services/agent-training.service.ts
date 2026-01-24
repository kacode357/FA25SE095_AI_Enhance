/**
 * Training API Service
 * 
 * REST API calls tới Training Backend cho các chức năng:
 * - Submit crawl jobs để thu thập patterns từ website
 * - Quản lý pattern buffers (review, commit, discard)
 * - Theo dõi training queue và statistics
 * - Version history và knowledge insights
 */

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
} from "@/types/agent-training/training.types";

// ============================================================
// REQUEST DEDUPLICATION
// Tránh gọi API trùng lặp khi component re-render
// ============================================================

const inFlightRequests = new Map<string, Promise<any>>();

/** Dedupe wrapper: nếu request đang chạy thì return promise cũ */
const withDedupe = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const existing = inFlightRequests.get(key);
  if (existing) return existing as Promise<T>;
  
  const request = fetcher().finally(() => inFlightRequests.delete(key));
  inFlightRequests.set(key, request);
  return request;
};

// ============================================================
// ERROR HANDLING
// ============================================================

/** Xử lý lỗi Axios và throw error message thân thiện */
const handleAxiosError = (error: AxiosError): never => {
  // Cho phép cancellation errors đi qua
  if (error.code === AxiosError.ERR_CANCELED || error.name === "CanceledError") {
    throw error;
  }

  if (error.response) {
    const { status, data } = error.response;
    const message = (data as any)?.message || (data as any)?.detail;

    const errorMessages: Record<number, string> = {
      400: message || "Yêu cầu không hợp lệ",
      401: "Chưa đăng nhập - vui lòng đăng nhập lại",
      403: "Không có quyền truy cập",
      404: "Không tìm thấy dữ liệu",
      422: message || "Dữ liệu không hợp lệ",
      429: "Quá nhiều request - vui lòng thử lại sau",
      500: "Lỗi server - vui lòng thử lại sau",
      503: "Service không khả dụng",
    };

    throw new Error(errorMessages[status] || message || `Request failed: ${status}`);
  }

  throw new Error(error.request ? "Lỗi mạng - kiểm tra kết nối" : error.message);
};

// ============================================================
// TRAINING API
// ============================================================

export const trainingApi = {
  // ------------------------------------------------------------
  // HEALTH CHECK
  // ------------------------------------------------------------
  
  /** Kiểm tra Training API có hoạt động không */
  async healthCheck() {
    try {
      const response = await trainingAxiosInstance.get("/health");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // ------------------------------------------------------------
  // CRAWL & FEEDBACK
  // Submit URL để AI crawl và học patterns
  // ------------------------------------------------------------

  /** Submit crawl job - AI sẽ crawl URL và extract patterns */
  async submitCrawl(job: CrawlJob): Promise<CrawlResult | QueuedJobResponse> {
    try {
      const response = await trainingAxiosInstance.post("/train-crawl", job);
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  /** Submit feedback cho job đã crawl */
  async submitFeedback(jobId: string, feedback: string): Promise<FeedbackResponse> {
    try {
      const response = await trainingAxiosInstance.post("/feedback", { job_id: jobId, feedback });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // ------------------------------------------------------------
  // STATISTICS & INSIGHTS
  // Thống kê về training progress
  // ------------------------------------------------------------

  /** Lấy training statistics */
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

  /** Lấy learning insights - tóm tắt AI knowledge */
  async getLearningInsights(signal?: AbortSignal): Promise<LearningInsights> {
    return withDedupe("learning_insights", async () => {
      try {
        const response = await trainingAxiosInstance.get("/knowledge/insights", { signal });
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  // ------------------------------------------------------------
  // KNOWLEDGE & RL
  // Quản lý patterns và RL policy
  // ------------------------------------------------------------

  /** Lấy danh sách learned patterns */
  async getPatterns() {
    try {
      const response = await trainingAxiosInstance.get("/knowledge/patterns");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  /** Trigger knowledge consolidation */
  async triggerConsolidation() {
    try {
      const response = await trainingAxiosInstance.post("/knowledge/consolidate");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  /** Lấy RL policy hiện tại */
  async getRLPolicy() {
    try {
      const response = await trainingAxiosInstance.get("/rl/policy");
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // ------------------------------------------------------------
  // QUEUE
  // Theo dõi training jobs trong queue
  // ------------------------------------------------------------

  /** Lấy queue status */
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

  /** Lấy danh sách pending jobs */
  async getPendingJobs(): Promise<TrainingJob[]> {
    try {
      const response = await trainingAxiosInstance.get("/queue/pending");
      return response.data?.pending_jobs || [];
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // ------------------------------------------------------------
  // BUFFERS
  // Pattern buffers chờ admin review trước khi commit
  // ------------------------------------------------------------

  /** Lấy tất cả buffers */
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

  /** Lấy pending buffers chờ review */
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

  /** Lấy chi tiết buffer theo job_id */
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

  /** Commit buffer vào training data - cần 5 commits để tạo version mới */
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
  }> {
    try {
      const response = await trainingAxiosInstance.post(`/commit-training/${jobId}`, {
        admin_id: adminId,
        feedback,
      });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  /** Lấy trạng thái pending commits (đã commit bao nhiêu/cần bao nhiêu) */
  async getPendingCommitsStatus(): Promise<PendingCommitsStatus> {
    return withDedupe("pending_commits_status", async () => {
      try {
        const response = await trainingAxiosInstance.get("/pending-commits/status");
        return response.data;
      } catch (err) {
        throw handleAxiosError(err as AxiosError);
      }
    });
  },

  /** Hủy buffer - không dùng patterns này */
  async discardBuffer(jobId: string, adminId = "admin"): Promise<{ message: string }> {
    try {
      const response = await trainingAxiosInstance.delete(`/buffer/${jobId}`, {
        params: { admin_id: adminId },
      });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  /** Submit negative feedback - đánh dấu patterns xấu */
  async submitNegativeFeedback(
    jobId: string,
    adminId: string,
    feedback: string
  ): Promise<{ status: string; message: string }> {
    try {
      const response = await trainingAxiosInstance.post(
        `/buffer/${jobId}/negative-feedback`,
        null,
        { params: { admin_id: adminId, feedback } }
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err as AxiosError);
    }
  },

  // ------------------------------------------------------------
  // VERSIONS
  // Lịch sử các phiên bản AI model
  // ------------------------------------------------------------

  /** Lấy version history */
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

  /** Export resources cho version hiện tại */
  async exportResources(): Promise<{ filename: string; version: number }> {
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
