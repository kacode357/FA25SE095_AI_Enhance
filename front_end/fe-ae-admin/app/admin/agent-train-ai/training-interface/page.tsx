"use client";

import React, { useEffect, useRef, useState } from "react";

import {
  CrawlJob,
  CrawlResult,
  FeedbackResponse,
  WebSocketMessage,
  LearningCycleComplete,
} from "@/types/agent-training/training.types";
import { trainingApi } from "@/services/agent-training.service";
import wsService from "@/services/agent-training.websocket";
import { Button } from "@/components/ui/button";

import { ErrorBoundary } from "../../components/agent-training/ErrorBoundary";
import { CrawlJobForm } from "../../components/agent-training/CrawlJobForm";
import { CrawlResults } from "../../components/agent-training/CrawlResults";
import { CrawlLogConsole } from "../../components/agent-training/CrawlLogConsole";
import { FeedbackForm } from "../../components/agent-training/FeedbackForm";
import { TrainingGuide } from "../../components/agent-training/TrainingGuide";

const WS_CHECK_INTERVAL = 1000;
const MAX_NOTIFICATIONS = 5;
const NOTIFICATION_TIMEOUT = 5000;

interface Notification {
  id: string;
  message: string;
}

const TrainingInterfacePage: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<CrawlResult | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackRequired, setFeedbackRequired] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notificationTimeoutsRef =
    useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const feedbackSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    wsService.connect();

    const handleMessage = (message: WebSocketMessage) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Training WS message:", message);
      }

      switch (message.type) {
        case "job_completed":
          addNotification(
            `Job ${message.job_id?.substring(0, 8) ?? ""} completed`
          );
          break;
        case "feedback_received":
          addNotification("Feedback processed successfully");
          break;
        case "update_cycle":
          addNotification(`Learning cycle ${message.cycle} completed!`);
          break;
        case "learning_cycle_complete": {
          const data = message as unknown as LearningCycleComplete;
          if (
            data?.cycle &&
            data?.performance_metrics?.avg_reward !== undefined
          ) {
            addNotification(
              `🎓 Learning Cycle ${data.cycle} Complete! Avg Reward: ${data.performance_metrics.avg_reward.toFixed(
                2
              )}`
            );
          } else {
            addNotification("🎓 Learning Cycle Complete!");
          }
          break;
        }
        case "error":
          addNotification(`Error: ${message.message}`);
          break;
        default:
          break;
      }
    };

    wsService.on("all", handleMessage);

    const checkConnection = setInterval(() => {
      setWsConnected(wsService.isConnected());
    }, WS_CHECK_INTERVAL);

    const timeoutsMap = notificationTimeoutsRef.current;

    return () => {
      wsService.off("all", handleMessage);
      clearInterval(checkConnection);
      timeoutsMap.forEach((timeout) => clearTimeout(timeout));
      timeoutsMap.clear();
    };
  }, []);

  const addNotification = (message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message };

    setNotifications((prev) => {
      const updated = [...prev, notification];
      return updated.slice(-MAX_NOTIFICATIONS);
    });

    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notificationTimeoutsRef.current.delete(id);
    }, NOTIFICATION_TIMEOUT);

    notificationTimeoutsRef.current.set(id, timeout);
  };

  const scrollToFeedbackSection = () => {
    if (feedbackSectionRef.current) {
      feedbackSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleCrawlSubmit = async (job: CrawlJob) => {
    setCrawling(true);
    setCurrentResult(null);
    setCurrentJobId(null);
    setFeedbackRequired(false);
    setResultDialogOpen(false);

    try {
      const result = await trainingApi.submitCrawl(job);
      setCurrentResult(result);
      setCurrentJobId(result.job_id);
      setFeedbackRequired(true);
      setResultDialogOpen(true);
      addNotification("Crawl completed! Please provide feedback.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      if (process.env.NODE_ENV === "development") {
        console.error("Crawl failed:", error);
      }
      addNotification(`Crawl failed: ${errorMessage}`);
    } finally {
      setCrawling(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!currentResult || submittingFeedback) return;

    setSubmittingFeedback(true);

    try {
      const response: FeedbackResponse = await trainingApi.submitFeedback(
        currentResult.job_id,
        feedback
      );

      if (response.status === "clarification_needed") {
        addNotification(
          response.question
            ? `Feedback received. Clarification skipped: ${response.question}`
            : "Feedback received. Clarification skipped."
        );
      } else {
        addNotification("Feedback accepted! Agent is learning...");
      }
      setFeedbackRequired(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      if (process.env.NODE_ENV === "development") {
        console.error("Feedback submission failed:", error);
      }
      addNotification(`Feedback failed: ${errorMessage}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleResultsDialogChange = (open: boolean) => {
    if (!open) {
      setResultDialogOpen(false);
      if (feedbackRequired) {
        scrollToFeedbackSection();
      }
      return;
    }

    if (currentResult) {
      setResultDialogOpen(true);
    }
  };

  return (
    <div className="space-y-4 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Training Interface
          </h1>
          <p className="text-xs text-slate-500">
            Submit crawl jobs, inspect results, and teach the agent with
            feedback.
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            wsConnected
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span className="mr-1 text-base">
            {wsConnected ? "●" : "○"}
          </span>
          {wsConnected ? "Connected to training agent" : "Disconnected"}
        </span>
      </header>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm"
              role="alert"
            >
              {n.message}
            </div>
          ))}
        </div>
      )}

      <main className="grid gap-4 lg:grid-cols-2">
        <ErrorBoundary>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Submit Crawl Job
            </h2>
            <CrawlJobForm onSubmit={handleCrawlSubmit} disabled={crawling} />
          </section>
        </ErrorBoundary>

        <ErrorBoundary>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Live Crawl Logs
                </h2>
          
              </div>
            </div>
            <CrawlLogConsole jobId={currentJobId} isActive={crawling} />
          </section>
        </ErrorBoundary>
      </main>

      <ErrorBoundary>
        <TrainingGuide
          action={
            currentResult ? (
              <Button
                size="sm"
                variant="primary"
                className="view-last-crawl-btn"
                onClick={() => setResultDialogOpen(true)}
              >
                View last crawl result
              </Button>
            ) : null
          }
        />
      </ErrorBoundary>

      {feedbackRequired && currentResult && (
        <div className="space-y-2" ref={feedbackSectionRef}>
          <FeedbackForm
            jobId={currentResult.job_id}
            onSubmit={handleFeedbackSubmit}
            disabled={submittingFeedback}
          />
        </div>
      )}

      <CrawlResults
        result={currentResult}
        open={resultDialogOpen && !!currentResult}
        onOpenChange={handleResultsDialogChange}
      />
    </div>
  );
};

export default TrainingInterfacePage;
