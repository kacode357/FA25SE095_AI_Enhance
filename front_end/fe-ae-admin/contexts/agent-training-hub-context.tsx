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
import type {
  LearningCycleComplete,
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
}

const AgentTrainingHubContext =
  createContext<AgentTrainingHubContextValue | null>(null);

export const AgentTrainingHubProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [wsConnected, setWsConnected] = useState(false);

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

  useEffect(() => {
    wsService.connect();

    // Xử lý WebSocket messages và hiện toast notifications
    const handleMessage = (message: WebSocketMessage) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Agent training message:", message);
      }

      // Crawl job hoàn thành
      if (message.type === "job_completed") {
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
  }, [addNotification]);

  const value = useMemo(
    () => ({
      wsConnected,
      addNotification,
    }),
    [wsConnected, addNotification]
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
