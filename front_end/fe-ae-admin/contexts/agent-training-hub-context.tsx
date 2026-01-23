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

const WS_CHECK_INTERVAL = 1000;

type NotificationVariant = "default" | "success" | "error" | "info" | "warning";

interface AgentTrainingHubContextValue {
  wsConnected: boolean;
  addNotification: (
    message: string,
    options?: { variant?: NotificationVariant }
  ) => void;
  submitCrawl: (
    job: CrawlJob
  ) => Promise<CrawlResult | QueuedJobResponse>;
  onJobCompleted: (callback: (data: { job_id: string; success: boolean; items_count: number }) => void) => () => void;
}

const AgentTrainingHubContext =
  createContext<AgentTrainingHubContextValue | null>(null);

export const AgentTrainingHubProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [wsConnected, setWsConnected] = useState(false);
  const [jobCompletedCallbacks, setJobCompletedCallbacks] = useState<
    Array<(data: { job_id: string; success: boolean; items_count: number }) => void>
  >([]);

  const addNotification = useCallback(
    (message: string, options?: { variant?: NotificationVariant }) => {
      switch (options?.variant) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        default:
          toast(message);
      }
    },
    []
  );

  // Submit crawl job qua REST API
  const submitCrawl = useCallback(
    async (job: CrawlJob): Promise<CrawlResult | QueuedJobResponse> => {
      console.log("[Hub] Đang gửi crawl request qua API:", {
        url: job.url,
        description: job.user_description,
        maxPages: job.max_pages
      });
      
      try {
        const result = await trainingApi.submitCrawl(job);
        console.log("[Hub] Crawl response:", result);
        return result;
      } catch (error) {
        console.error("[Hub] Crawl failed:", error);
        throw error;
      }
    },
    []
  );

  // Đăng ký callback khi job completed (return unsubscribe function)
  const onJobCompleted = useCallback(
    (callback: (data: { job_id: string; success: boolean; items_count: number }) => void) => {
      setJobCompletedCallbacks(prev => [...prev, callback]);
      return () => {
        setJobCompletedCallbacks(prev => prev.filter(cb => cb !== callback));
      };
    },
    []
  );

  useEffect(() => {
    wsService.connect();

    // Xử lý WebSocket messages và hiện toast notifications
    const handleMessage = (message: WebSocketMessage) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Agent training message:", message);
      }

      // Crawl job hoàn thành
      if (message.type === "job_completed") {
        const jobData = {
          job_id: message.job_id || "",
          success: (message as any).success ?? true,
          items_count: (message as any).items_count ?? 0,
        };
        
        console.log("[Hub] ✓ Nhận được job_completed event:", {
          ...jobData,
          timestamp: new Date().toISOString(),
          fullData: message
        });
        
        // Trigger tất cả callbacks đã đăng ký
        jobCompletedCallbacks.forEach(callback => {
          try {
            callback(jobData);
          } catch (error) {
            console.error("[Hub] Callback error:", error);
          }
        });
        
        addNotification(
          `Job ${message.job_id?.substring(0, 8) ?? ""} completed successfully`,
          { variant: "success" }
        );
      } else if (message.type === "feedback_received") {
        addNotification("Feedback processed successfully", {
          variant: "success",
        });
      } else if (message.type === "update_cycle") {
        addNotification(`Learning cycle ${message.cycle} completed`, {
          variant: "info",
        });
      } else if (message.type === "learning_cycle_complete") {
        const data = message as unknown as LearningCycleComplete;
        if (
          data?.cycle &&
          data?.performance_metrics?.avg_reward !== undefined
        ) {
          addNotification(
            `dYZ" Learning Cycle ${data.cycle} complete! Avg reward ${data.performance_metrics.avg_reward.toFixed(
              2
            )}`,
            { variant: "success" }
          );
        } else {
          addNotification('dYZ" Learning Cycle complete!', {
            variant: "success",
          });
        }
                  } else if (message.type === "training_queued") {
        addNotification(
          `Training job queued at position #${message.position ?? 0}`,
          { variant: "info" }
        );
      } else if (message.type === "training_started") {
        addNotification(
          `Training started for job ${message.job_id?.substring(0, 8) ?? ""}`,
          { variant: "info" }
        );
      } else if (message.type === "training_completed") {
        addNotification(
          `Training completed for job ${message.job_id?.substring(0, 8) ?? ""}`,
          { variant: "success" }
        );
      } else if (message.type === "training_failed") {
        addNotification(
          `Training failed for job ${message.job_id?.substring(0, 8) ?? ""}: ${
            message.message ?? "unknown error"
          }`,
          { variant: "error" }
        );
      } else if (
        message.type === "version_committed" ||
        message.type === "version_created"
      ) {
        addNotification(
          `Version ${message.version ?? ""} committed by ${
            message.admin_id ?? "admin"
          }`,
          { variant: "success" }
        );
      } else if (message.type === "buffer_created") {
        addNotification(
          `Buffer ready for job ${message.job_id?.substring(0, 8) ?? ""}`,
          { variant: "info" }
        );
      } else if (message.type === "buffer_ready") {
        addNotification(
          `Buffer available for review ${message.job_id?.substring(0, 8) ?? ""}`,
          { variant: "info" }
        );
      } else if (message.type === "buffer_discarded") {
        addNotification(
          `Buffer discarded for job ${message.job_id?.substring(0, 8) ?? ""}`,
          { variant: "warning" }
        );
      } else if (message.type === "error") {


        addNotification(`Error: ${message.message}`, { variant: "error" });
      }
    };

    wsService.on("all", handleMessage);

    const checkConnection = setInterval(() => {
      setWsConnected(wsService.isConnected());
    }, WS_CHECK_INTERVAL);

    return () => {
      wsService.off("all", handleMessage);
      clearInterval(checkConnection);
      wsService.disconnect();
    };
  }, [addNotification, jobCompletedCallbacks]);

  const value = useMemo(
    () => ({
      wsConnected,
      addNotification,
      submitCrawl,
      onJobCompleted,
    }),
    [wsConnected, addNotification, submitCrawl, onJobCompleted]
  );

  return (
    <AgentTrainingHubContext.Provider value={value}>
      {children}
    </AgentTrainingHubContext.Provider>
  );
};

export const useAgentTrainingHub = () => {
  const ctx = useContext(AgentTrainingHubContext);
  if (!ctx) {
    throw new Error(
      "useAgentTrainingHub must be used within AgentTrainingHubProvider"
    );
  }
  return ctx;
};
