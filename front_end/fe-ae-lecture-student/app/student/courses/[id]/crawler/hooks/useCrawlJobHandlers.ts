"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";

type FetchAssignmentConversations = (
  assignmentId: string,
  opts: { myOnly: boolean }
) => Promise<unknown>;

type ReloadConversation = (opts: { jobIdOverride: string }) => Promise<unknown>;

type Options = {
  activeJobId: string | null;
  assignmentId?: string | null;
  setActiveJobId: Dispatch<SetStateAction<string | null>>;
  setCrawlStatusMsg: Dispatch<SetStateAction<string>>;
  setCrawlProgress: Dispatch<SetStateAction<number>>;
  setIsCrawling: Dispatch<SetStateAction<boolean>>;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  setShowResultsModal: Dispatch<SetStateAction<boolean>>;
  fetchJobResults: (jobId: string) => Promise<unknown>;
  fetchJob: (jobId: string) => Promise<unknown>;
  fetchAssignmentConversations: FetchAssignmentConversations;
  reloadConversation: ReloadConversation;
};

export const useCrawlJobHandlers = ({
  activeJobId,
  assignmentId,
  setActiveJobId,
  setCrawlStatusMsg,
  setCrawlProgress,
  setIsCrawling,
  setSubmitting,
  setShowResultsModal,
  fetchJobResults,
  fetchJob,
  fetchAssignmentConversations,
  reloadConversation,
}: Options) => {
  const updateCrawlProgress = useCallback(
    (next: number) => {
      setCrawlProgress((prev) => {
        const clamped = Math.min(100, Math.max(0, next));
        if (Number.isFinite(prev)) {
          return Math.max(prev, clamped);
        }
        return clamped;
      });
    },
    [setCrawlProgress]
  );

  const getPayloadJobId = useCallback((payload: any) => {
    return payload?.jobId || payload?.JobId || payload?.jobID || payload?.JobID || null;
  }, []);

  const handleJobStarted = useCallback(
    (payload: any) => {
      const jid = getPayloadJobId(payload);
      if (jid && activeJobId && jid !== activeJobId) return;
      setCrawlStatusMsg(payload?.message || "Crawler started...");
      updateCrawlProgress(12);
    },
    [activeJobId, getPayloadJobId, setCrawlStatusMsg, updateCrawlProgress]
  );

  const handleJobProgress = useCallback(
    (payload: any) => {
      const jid = getPayloadJobId(payload);
      if (jid && activeJobId && jid !== activeJobId) return;

      if (typeof payload?.progress === "number") {
        updateCrawlProgress(payload.progress);
      } else if (typeof payload?.progressPercentage === "number") {
        updateCrawlProgress(payload.progressPercentage);
      }

      if (payload?.message) {
        setCrawlStatusMsg(payload.message);
      }
    },
    [activeJobId, getPayloadJobId, setCrawlStatusMsg, updateCrawlProgress]
  );

  const handleJobNavigation = useCallback(
    (payload: any) => {
      const jid = getPayloadJobId(payload);
      if (jid && activeJobId && jid !== activeJobId) return;

      const eventType =
        payload?.navigationEventType || payload?.NavigationEventType;
      const message = payload?.message;

      if (message) {
        setCrawlStatusMsg(message);
      }

      switch (eventType) {
        case "NavigationPlanningStarted":
          updateCrawlProgress(10);
          if (!message) {
            setCrawlStatusMsg("Planning navigation...");
          }
          break;
        case "NavigationPlanningCompleted":
          updateCrawlProgress(20);
          if (!message) {
            setCrawlStatusMsg("Navigation plan ready...");
          }
          break;
        case "NavigationExecutionStarted":
          updateCrawlProgress(30);
          if (!message) {
            setCrawlStatusMsg("Navigating pages...");
          }
          break;
        case "NavigationStepCompleted": {
          const stepNumber = payload?.stepNumber ?? payload?.StepNumber;
          const totalSteps = payload?.totalSteps ?? payload?.TotalSteps;
          let next = 40;
          if (
            typeof stepNumber === "number" &&
            typeof totalSteps === "number" &&
            totalSteps > 0
          ) {
            next = 30 + Math.min(20, (stepNumber / totalSteps) * 20);
          }
          updateCrawlProgress(next);
          if (!message) {
            const action = payload?.action || payload?.Action;
            setCrawlStatusMsg(
              action
                ? `Navigation step completed: ${action}`
                : "Navigation step completed."
            );
          }
          break;
        }
        default:
          if (!message && eventType) {
            setCrawlStatusMsg(`Navigation: ${eventType}`);
          }
          break;
      }
    },
    [activeJobId, getPayloadJobId, setCrawlStatusMsg, updateCrawlProgress]
  );

  const handleJobPagination = useCallback(
    (payload: any) => {
      const jid = getPayloadJobId(payload);
      if (jid && activeJobId && jid !== activeJobId) return;

      const pageNumber =
        payload?.pageNumber ??
        payload?.PageNumber ??
        payload?.totalPagesCollected ??
        payload?.TotalPagesCollected;
      const maxPages = payload?.maxPages ?? payload?.MaxPages;
      const base = 30;
      const range = 30;
      let next = base + range / 2;

      if (
        typeof pageNumber === "number" &&
        typeof maxPages === "number" &&
        maxPages > 0
      ) {
        const ratio = Math.min(1, pageNumber / maxPages);
        next = base + ratio * range;
      } else if (typeof pageNumber === "number") {
        next = Math.min(base + range, base + pageNumber * 2);
      }

      updateCrawlProgress(next);

      setCrawlStatusMsg("Collecting pages...");
    },
    [activeJobId, getPayloadJobId, setCrawlStatusMsg, updateCrawlProgress]
  );

  const handleJobExtraction = useCallback(
    (payload: any) => {
      const jid = getPayloadJobId(payload);
      if (jid && activeJobId && jid !== activeJobId) return;

      const eventType =
        payload?.extractionEventType || payload?.ExtractionEventType;
      const message = payload?.message;

      if (message) {
        setCrawlStatusMsg(message);
      }

      if (eventType === "DataExtractionStarted") {
        updateCrawlProgress(70);
        if (!message) {
          setCrawlStatusMsg("Extracting data...");
        }
      } else if (eventType === "DataExtractionCompleted") {
        updateCrawlProgress(90);
        if (!message) {
          const totalItems =
            payload?.totalItemsExtracted ?? payload?.TotalItemsExtracted;
          setCrawlStatusMsg(
            typeof totalItems === "number"
              ? `Extraction completed (${totalItems} items).`
              : "Extraction completed."
          );
        }
      } else {
        updateCrawlProgress(70);
        if (!message) {
          setCrawlStatusMsg("Extracting data...");
        }
      }
    },
    [activeJobId, getPayloadJobId, setCrawlStatusMsg, updateCrawlProgress]
  );

  const handleJobCompleted = useCallback(
    async (payload: any) => {
      const jid = getPayloadJobId(payload);

      setCrawlStatusMsg("Finalizing results...");

      if (!jid) {
        setIsCrawling(false);
        setSubmitting(false);
        return;
      }

      console.log("[CrawlerPage] Crawl job completed", { jobId: jid });
      setActiveJobId(jid);

      try {
        await fetchJobResults(jid);
        await fetchJob(jid);
        if (assignmentId) {
          await fetchAssignmentConversations(assignmentId, { myOnly: true });
        }
        await reloadConversation({ jobIdOverride: jid });
        updateCrawlProgress(100);
        setShowResultsModal(true);
      } catch (err) {
        console.error("[CrawlerPage] handleJobCompleted error:", err);
      } finally {
        setIsCrawling(false);
        setSubmitting(false);
      }
    },
    [
      assignmentId,
      fetchAssignmentConversations,
      fetchJob,
      fetchJobResults,
      getPayloadJobId,
      reloadConversation,
      setActiveJobId,
      setCrawlStatusMsg,
      setIsCrawling,
      setShowResultsModal,
      setSubmitting,
      updateCrawlProgress,
    ]
  );

  return {
    handleJobStarted,
    handleJobProgress,
    handleJobNavigation,
    handleJobPagination,
    handleJobExtraction,
    handleJobCompleted,
  };
};
