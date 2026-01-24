/**
 * Agent Training Hub Context
 * 
 * Central hub quản lý:
 * - Kết nối WebSocket với Training Backend
 * - Toast notifications cho training events
 * - Submit crawl jobs
 */

"use client";

import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import wsService from "@/services/agent-training.websocket";
import { trainingApi } from "@/services/agent-training.service";
import type {
  CrawlJob,
  CrawlResult,
  LearningCycleComplete,
  QueuedJobResponse,
  WebSocketMessage,
} from "@/types/agent-training/training.types";

// ============================================================
// TYPES & CONSTANTS
// ============================================================

const WS_CHECK_INTERVAL = 1000; // Kiểm tra connection mỗi 1s

type NotificationVariant = "default" | "success" | "error" | "info" | "warning";

interface AgentTrainingHubContextValue {
  /** Trạng thái kết nối WebSocket */
  wsConnected: boolean;
  /** Hiện toast notification */
  addNotification: (message: string, options?: { variant?: NotificationVariant }) => void;
  /** Submit crawl job để AI học patterns */
  submitCrawl: (job: CrawlJob) => Promise<CrawlResult | QueuedJobResponse>;
}

// ============================================================
// CONTEXT
// ============================================================

const AgentTrainingHubContext = createContext<AgentTrainingHubContextValue | null>(null);

export const AgentTrainingHubProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [wsConnected, setWsConnected] = useState(false);

  // ------------------------------------------------------------
  // NOTIFICATIONS
  // Hiển thị toast khi có events từ WebSocket
  // ------------------------------------------------------------

  const addNotification = useCallback(
    (message: string, options?: { variant?: NotificationVariant }) => {
      switch (options?.variant) {
        case "success": toast.success(message); break;
        case "error": toast.error(message); break;
        default: toast(message);
      }
    },
    []
  );

  // ------------------------------------------------------------
  // CRAWL SUBMISSION
  // Gửi URL để AI crawl và học patterns
  // ------------------------------------------------------------

  const submitCrawl = useCallback(async (job: CrawlJob): Promise<CrawlResult | QueuedJobResponse> => {
    console.log("[Hub] Submit crawl:", { url: job.url, maxPages: job.max_pages });
    return trainingApi.submitCrawl(job);
  }, []);

  // ------------------------------------------------------------
  // WEBSOCKET EVENT HANDLING
  // Lắng nghe events và hiện toast notifications
  // ------------------------------------------------------------

  useEffect(() => {
    // Kết nối WebSocket
    wsService.connect();

    // Handler cho tất cả messages từ WebSocket
    // Chỉ hiện các toast quan trọng
    const handleMessage = (message: WebSocketMessage) => {
      const jobIdShort = message.job_id?.substring(0, 8) ?? "";

      switch (message.type) {
        // ---- CRAWL COMPLETED ----
        case "job_completed":
          addNotification(`Crawl completed: ${jobIdShort}`, { variant: "success" });
          break;

        // ---- TRAINING FAILED ----
        case "training_failed":
          addNotification(`Training failed: ${message.message ?? "Unknown error"}`, { variant: "error" });
          break;

        // ---- VERSION CREATED ----
        case "version_committed":
        case "version_created":
          addNotification(`New version created: v${message.version ?? ""}`, { variant: "success" });
          break;

        // ---- BUFFER READY FOR REVIEW ----
        case "buffer_ready":
          addNotification(`Buffer ready for review: ${jobIdShort}`, { variant: "info" });
          break;

        // ---- ERROR ----
        case "error":
          addNotification(`Error: ${message.message}`, { variant: "error" });
          break;

        // Các events khác không cần toast (giảm noise)
        // - feedback_received, update_cycle, learning_cycle_complete
        // - training_queued, training_started, training_completed  
        // - buffer_created, buffer_discarded
        default:
          break;
      }
    };

    // Đăng ký handler cho tất cả events
    wsService.on("all", handleMessage);

    // Kiểm tra connection status định kỳ
    const checkConnection = setInterval(() => {
      setWsConnected(wsService.isConnected());
    }, WS_CHECK_INTERVAL);

    // Cleanup khi unmount
    return () => {
      wsService.off("all", handleMessage);
      clearInterval(checkConnection);
      wsService.disconnect();
    };
  }, [addNotification]);

  // ------------------------------------------------------------
  // CONTEXT VALUE
  // ------------------------------------------------------------

  const value = useMemo(
    () => ({ wsConnected, addNotification, submitCrawl }),
    [wsConnected, addNotification, submitCrawl]
  );

  return (
    <AgentTrainingHubContext.Provider value={value}>
      {children}
    </AgentTrainingHubContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

/** Hook để sử dụng Agent Training Hub context */
export const useAgentTrainingHub = () => {
  const ctx = useContext(AgentTrainingHubContext);
  if (!ctx) {
    throw new Error("useAgentTrainingHub phải dùng trong AgentTrainingHubProvider");
  }
  return ctx;
};
