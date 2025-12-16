"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

import {
  useCrawlerChatHub,
  MessageType,
  type ChatMessageDto,
} from "@/hooks/hubcrawlerchat/useCrawlerChatHub";
import { useCrawlHub } from "@/hooks/hubcrawlerchat/useCrawlHub";
import { useSmartCrawlerJobResults } from "@/hooks/smart-crawler/useSmartCrawlerJobResults";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { useAuth } from "@/contexts/AuthContext";
import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useCrawlerAssignmentConversations } from "@/hooks/crawler-chat/useCrawlerAssignmentConversations";
import { useCrawlerConversationMessages } from "@/hooks/crawler-chat/useCrawlerConversationMessages";
import { useSmartCrawlerJob } from "@/hooks/smart-crawler/useSmartCrawlerJob";
import { useDecodedUser } from "@/utils/secure-user";

import type { UiMessage } from "./crawler-types";
import CrawlerUrlPromptSection from "./components/CrawlerUrlPromptSection";
import CrawlerResultsSection from "./components/CrawlerResultsSection";
import CrawlerChatSection from "./components/CrawlerChatSection";
import CrawlerAssignmentHeader from "./components/CrawlerAssignmentHeader";
import CrawlerAssignmentDescription from "./components/CrawlerAssignmentDescription";
import CrawlerAssignmentConversationsSection from "./components/CrawlerAssignmentConversationsSection";
import { useCrawlerConversationState } from "./hooks/useCrawlerConversationState";
import useEventCallback from "./hooks/useEventCallback";
import {
  SUMMARY_KEYWORDS,
  generateGuid,
  isIgnorableSignalRError,
  makeId,
  buildUserIdentity,
  safeValidateUrl,
} from "@/utils/crawler-helpers";

const INVALID_SCOPE_VALUES = new Set(["", "null", "undefined", "demo"]);

const sanitizeScopeValue = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (INVALID_SCOPE_VALUES.has(trimmed.toLowerCase())) return null;
  return trimmed;
};

type PendingMessage = {
  content: string;
  conversationId: string | null;
  messageType?: MessageType;
};

const RESULT_FETCH_DELAY_MS = 10000;
const FINALIZE_PROGRESS_START = 97;
const FINALIZE_PROGRESS_TARGET = 100;

const waitForResultSync = (delayMs: number = RESULT_FETCH_DELAY_MS) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });

const CrawlerInner = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const assignmentParam = searchParams.get("assignmentId");
  const groupParam = searchParams.get("groupId");

  const assignmentId = useMemo(
    () => sanitizeScopeValue(assignmentParam),
    [assignmentParam]
  );
  const groupId = useMemo(
    () => sanitizeScopeValue(groupParam),
    [groupParam]
  );

  const courseSlug = useMemo(() => {
    if (!pathname) return "";
    const segments = pathname.split("/").filter(Boolean);
    const idx = segments.indexOf("courses");
    if (idx !== -1 && segments[idx + 1]) return segments[idx + 1];
    return "";
  }, [pathname]);

  const { user } = useAuth() as any;
  const decodedUser = useDecodedUser();
  const { userId, userName } = buildUserIdentity(decodedUser, user);

  const getAccessToken = useCallback(() => {
    const token = getSavedAccessToken();
    return token || "";
  }, []);

  const joinedConversationRef = useRef<string | null>(null);
  const crawlJobSubscriptionRef = useRef<((jobId: string) => Promise<void>) | null>(
    null
  );
  const pendingOutgoingRef = useRef<PendingMessage[]>([]);
  const finalizeProgressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlStatusMsg, setCrawlStatusMsg] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showAssignmentDrawer, setShowAssignmentDrawer] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Disable body scroll khi results modal mở
  useEffect(() => {
    if (showResultsModal) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    }

    return () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, [showResultsModal]);

  useEffect(() => {
    return () => {
      if (finalizeProgressTimerRef.current) {
        clearInterval(finalizeProgressTimerRef.current);
      }
    };
  }, []);

  const {
    data: assignmentRes,
    loading: assignmentLoading,
    fetchAssignment,
  } = useAssignmentById();
  const assignment = assignmentRes?.assignment;

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignment(assignmentId).catch((err) =>
      console.error("[CrawlerPage] fetchAssignment error:", err)
    );
  }, [assignmentId, fetchAssignment]);

  const {
    fetchAssignmentConversations,
    loading: conversationsLoading,
    conversations,
  } = useCrawlerAssignmentConversations();

  const {
    fetchConversationMessages,
    loading: conversationMessagesLoading,
  } = useCrawlerConversationMessages();

  const { fetchJob } = useSmartCrawlerJob();
  const {
    fetchJobResults,
    loading: resultsLoading,
    results,
  } = useSmartCrawlerJobResults();

  const {
    conversationId,
    selectedConversationId,
    chatMessages,
    setChatMessages,
    appendUiMessage,
    reloadConversation,
    jobHistory,
    historyIndex,
    currentHistoryEntry,
    activeJobId,
    setActiveJobId,
    handleSelectHistoryIndex,
    selectConversation,
  } = useCrawlerConversationState({
    fetchConversationMessages,
    fetchJobResults,
    userId,
    resultsLoading,
  });

  const promptUsed = useMemo(() => {
    if (!results?.length) return "";
    return results[0]?.promptUsed || "";
  }, [results]);

  const handleSelectConversation = useCallback(
    (convId: string) => {
      if (!convId) return;

      setIsCrawling(false);
      setCrawlProgress(0);
      setShowHistoryDrawer(false);

      void (async () => {
        const jobIdFromHistory = await selectConversation(convId);
        if (jobIdFromHistory) {
          await fetchJobResults(jobIdFromHistory);
        }
      })();
    },
    [fetchJobResults, selectConversation]
  );

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignmentConversations(assignmentId, { myOnly: true }).catch((err) =>
      console.error("[CrawlerPage] fetchAssignmentConversations error:", err)
    );
  }, [assignmentId, fetchAssignmentConversations]);

  const handleOpenDataPage = useCallback(() => {
    if (!activeJobId) return;
    const courseSegment = courseSlug || assignmentId || "unknown";
    const href = `/student/courses/${courseSegment}/crawler/data?jobId=${activeJobId}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }, [activeJobId, assignmentId, courseSlug]);

  const finalizeResultPreparation = useCallback(() => {
    if (finalizeProgressTimerRef.current) {
      clearInterval(finalizeProgressTimerRef.current);
      finalizeProgressTimerRef.current = null;
    }

    return new Promise<void>((resolve) => {
      let current = FINALIZE_PROGRESS_START;
      setCrawlProgress(current);
      const steps = Math.max(
        1,
        FINALIZE_PROGRESS_TARGET - FINALIZE_PROGRESS_START
      );
      const stepDelay = RESULT_FETCH_DELAY_MS / steps;
      finalizeProgressTimerRef.current = setInterval(() => {
        current += 1;
        setCrawlProgress((prev) =>
          Math.min(Math.max(prev, current), FINALIZE_PROGRESS_TARGET)
        );
        if (current >= FINALIZE_PROGRESS_TARGET) {
          if (finalizeProgressTimerRef.current) {
            clearInterval(finalizeProgressTimerRef.current);
            finalizeProgressTimerRef.current = null;
          }
          resolve();
        }
      }, stepDelay);
    });
  }, []);

  const pushUiMessageFromDto = useCallback(
    async (message: ChatMessageDto) => {
      const normalizedContent = (message.content || "").trim();
      const messageType =
        message.messageType ?? MessageType.UserMessage;

      if (
        message.userId === userId &&
        [MessageType.UserMessage, MessageType.FollowUpQuestion, MessageType.CrawlRequest].includes(
          messageType
        )
      ) {
        const convId = message.conversationId || null;
        const pendingIdx = pendingOutgoingRef.current.findIndex(
          (pending) =>
            pending.content === normalizedContent &&
            pending.conversationId === convId &&
            pending.messageType === messageType
        );
        if (pendingIdx !== -1) {
          pendingOutgoingRef.current.splice(pendingIdx, 1);
          return;
        }
      }

      const role: UiMessage["role"] =
        messageType === MessageType.SystemNotification
          ? "system"
          : messageType === MessageType.AiSummary
          ? "assistant"
          : message.userId === userId
          ? "user"
          : "assistant";

      const uiMessage: UiMessage = {
        id: message.messageId || makeId(),
        role,
        content: message.content,
        createdAt: message.timestamp || new Date().toISOString(),
        messageType,
        crawlJobId: message.crawlJobId,
        visualizationData: (message as any).visualizationData,
        extractedData: (message as any).extractedData,
      };

      appendUiMessage(uiMessage);

      const isResultMessage =
        messageType === MessageType.CrawlResult ||
        messageType === MessageType.AiSummary;
      const jobId = message.crawlJobId;
      const convId = message.conversationId || null;

      if (
        isResultMessage &&
        jobId &&
        convId &&
        convId === conversationId
      ) {
        setActiveJobId(jobId);
        try {
          await waitForResultSync();
          await fetchJobResults(jobId);
        } catch (err) {
          console.error("[CrawlerPage] fetchJobResults realtime error:", err);
        }
        await reloadConversation({ jobIdOverride: jobId });
      }
    },
    [appendUiMessage, conversationId, fetchJobResults, reloadConversation, userId]
  );

  const handleJobStarted = useCallback(
    (payload: any) => {
      const jid = payload?.jobId || payload?.JobId;
      if (jid && activeJobId && jid !== activeJobId) return;
      setCrawlStatusMsg("Crawler started...");
      setCrawlProgress(10);
    },
    [activeJobId]
  );

  const handleJobProgress = useCallback(
    (payload: any) => {
      const jid = payload?.jobId || payload?.JobId;
      if (jid && activeJobId && jid !== activeJobId) return;

      if (typeof payload?.progress === "number") {
        setCrawlProgress(payload.progress);
      } else if (typeof payload?.progressPercentage === "number") {
        setCrawlProgress(payload.progressPercentage);
      }

      if (payload?.message) {
        setCrawlStatusMsg(payload.message);
      }
    },
    [activeJobId]
  );

  const handleJobCompleted = useCallback(
    async (payload: any) => {
      const jid =
        payload?.jobId || payload?.JobId || payload?.jobID || null;

      setCrawlStatusMsg("Finalizing results...");

      if (!jid) {
        setIsCrawling(false);
        setSubmitting(false);
        return;
      }

      console.log("[CrawlerPage] Crawl job completed", { jobId: jid });
      setActiveJobId(jid);

      try {
        await finalizeResultPreparation();
        await fetchJobResults(jid);
        await fetchJob(jid);
        if (assignmentId) {
          await fetchAssignmentConversations(assignmentId, { myOnly: true });
        }
        await reloadConversation({ jobIdOverride: jid });
        setCrawlProgress(FINALIZE_PROGRESS_TARGET);
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
      finalizeResultPreparation,
      reloadConversation,
    ]
  );

  const handleCrawlInitiated = useCallback(async (data: { crawlJobId: string }) => {
    const jid = data.crawlJobId;
    if (!jid) return;

    console.log("[CrawlerPage] Crawl job queued", { jobId: jid });
    setActiveJobId(jid);
    setCrawlStatusMsg("Job queued successfully...");
    setCrawlProgress(5);

    const subscribeFn = crawlJobSubscriptionRef.current;
    if (!subscribeFn) return;

    try {
      await subscribeFn(jid);
    } catch (err) {
      if (!isIgnorableSignalRError(err)) {
        console.error("[CrawlerPage] subscribeToJob error:", err);
      }
    }
  }, []);

  const handleCrawlHubError = useCallback(
    (message: string) => {
      if (!isIgnorableSignalRError(message)) {
        console.error("[CrawlerPage] CrawlHub error:", message);
        if (isCrawling) {
          setIsCrawling(false);
          setSubmitting(false);
          toast.error("Crawler connection interrupted. Please try again.");
        }
      }
    },
    [isCrawling]
  );

  const handleChatHubError = useCallback((message: string) => {
    if (!isIgnorableSignalRError(message)) {
      console.error("[CrawlerPage] ChatHub error:", message);
    }
  }, []);

  const jobStartedHandler = useEventCallback(handleJobStarted);
  const jobProgressHandler = useEventCallback(handleJobProgress);
  const jobCompletedHandler = useEventCallback(handleJobCompleted);
  const crawlHubErrorHandler = useEventCallback(handleCrawlHubError);
  const crawlInitiatedHandler = useEventCallback(handleCrawlInitiated);
  const chatHubErrorHandler = useEventCallback(handleChatHubError);
  const pushUiMessageHandler = useEventCallback(pushUiMessageFromDto);

  const {
    connected: crawlConnected,
    connecting: crawlConnecting,
    connect: connectCrawl,
    disconnect: disconnectCrawl,
    subscribeToJob,
    subscribeToAssignmentJobs,
    subscribeToGroupJobs,
  } = useCrawlHub({
    getAccessToken,
    onJobStarted: jobStartedHandler,
    onJobProgress: jobProgressHandler,
    onJobCompleted: jobCompletedHandler,
    onError: crawlHubErrorHandler,
  });

  crawlJobSubscriptionRef.current = subscribeToJob;

  const {
    connected: chatConnected,
    connecting: chatConnecting,
    connect: connectChat,
    disconnect: disconnectChat,
    subscribeToAssignment,
    joinGroupWorkspace,
    joinConversation,
    leaveConversation,
    sendCrawlerMessage,
  } = useCrawlerChatHub({
    getAccessToken,
    onUserMessageReceived: pushUiMessageHandler,
    onGroupMessageReceived: pushUiMessageHandler,
    onCrawlInitiated: crawlInitiatedHandler,
    onError: chatHubErrorHandler,
  });

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!mounted) return;
      try {
        await connectChat();
        await connectCrawl();
      } catch (err) {
        if (mounted) {
          console.error("[CrawlerPage] connect hubs error:", err);
        }
      }
    };
    void init();
    return () => {
      mounted = false;
      disconnectChat().catch(() => {});
      disconnectCrawl().catch(() => {});
    };
  }, [connectChat, connectCrawl, disconnectChat, disconnectCrawl]);

  useEffect(() => {
    if (!chatConnected || !conversationId) return;
    let cancelled = false;

    void (async () => {
      try {
        const previous = joinedConversationRef.current;
        if (previous && previous !== conversationId) {
          await leaveConversation(previous);
        }
        await joinConversation(conversationId);
        if (!cancelled) {
          joinedConversationRef.current = conversationId;
        }
      } catch (err) {
        if (!cancelled && !isIgnorableSignalRError(err)) {
          console.error("[CrawlerPage] joinConversation error:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatConnected, conversationId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!chatConnected || !assignmentId) return;
    let active = true;

    void (async () => {
      try {
        await subscribeToAssignment(assignmentId);
        if (groupId) {
          await joinGroupWorkspace(groupId);
        }
      } catch (err) {
        if (active && !isIgnorableSignalRError(err)) {
          console.error("[CrawlerPage] subscribe assignment chat error:", err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [chatConnected, assignmentId, groupId, subscribeToAssignment, joinGroupWorkspace]);

  useEffect(() => {
    if (!crawlConnected) return;
    let active = true;

    void (async () => {
      try {
        if (assignmentId) {
          await subscribeToAssignmentJobs(assignmentId);
        }
        if (groupId) {
          await subscribeToGroupJobs(groupId);
        }
      } catch (err) {
        if (active && !isIgnorableSignalRError(err)) {
          console.error("[CrawlerPage] subscribe crawl jobs error:", err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    crawlConnected,
    assignmentId,
    groupId,
    subscribeToAssignmentJobs,
    subscribeToGroupJobs,
  ]);

  const handleStartCrawl = useCallback(async () => {
    const trimmedUrl = url.trim();
    const trimmedPrompt = prompt.trim();

    if (!trimmedUrl) return toast.error("Please enter a URL first.");
    if (!trimmedPrompt) return toast.error("Please describe what you want to extract.");
    if (!safeValidateUrl(trimmedUrl)) return toast.error("Invalid URL.");
    if (!chatConnected) return toast.error("Chat connection is establishing... Please wait.");
    if (!assignmentId) return toast.error("Missing assignmentId. Please reload from assignment context.");
    if (!userId) return toast.error("UserId not found. Please reload.");

    if (finalizeProgressTimerRef.current) {
      clearInterval(finalizeProgressTimerRef.current);
      finalizeProgressTimerRef.current = null;
    }

    setSubmitting(true);
    setIsCrawling(true);
    setCrawlStatusMsg("Initiating crawl request...");
    setCrawlProgress(0);

    const payloadConversationId = conversationId || generateGuid();
    const normalizedUserId = String(userId);

    const rawPayload: ChatMessageDto = {
      messageId: generateGuid(),
      conversationId: payloadConversationId,
      userId: normalizedUserId,
      userName,
      content: `${trimmedPrompt} | ${trimmedUrl}`,
      messageType: MessageType.CrawlRequest,
      timestamp: new Date().toISOString(),
      groupId,
      assignmentId,
    };

    try {
      await sendCrawlerMessage(rawPayload);
      console.log("[CrawlerPage] Crawl request sent", {
        conversationId: payloadConversationId,
        assignmentId,
        groupId,
        url: trimmedUrl,
      });
      appendUiMessage({
        id: rawPayload.messageId!,
        role: "user",
        content: rawPayload.content,
        createdAt: rawPayload.timestamp!,
        messageType: MessageType.CrawlRequest,
        crawlJobId: null,
      });
      setUrl("");
      setPrompt("");
    } catch (err: any) {
      console.error("[CrawlerPage] sendCrawlerMessage error:", err);
      toast.error(err?.message || "Failed to send crawl request");
      setIsCrawling(false);
      setSubmitting(false);
    }
  }, [
    appendUiMessage,
    assignmentId,
    chatConnected,
    conversationId,
    groupId,
    prompt,
    sendCrawlerMessage,
    url,
    userId,
    userName,
  ]);

  const handleSendChatMessage = useCallback(
    async (contentOverride?: string) => {
      const content = (contentOverride ?? chatInput).trim();
      if (!content) return;
      if (!chatConnected) return;

      const normalizedContent = content.toLowerCase();
      const messageType = SUMMARY_KEYWORDS.some((keyword) =>
        normalizedContent.includes(keyword)
      )
        ? MessageType.FollowUpQuestion
        : MessageType.UserMessage;

      pendingOutgoingRef.current.push({
        content,
        conversationId,
        messageType,
      });

      setChatInput("");
      setChatSending(true);

      const messageId = generateGuid();
      const sentAt = new Date().toISOString();

      const rawPayload: ChatMessageDto = {
        messageId,
        userId: String(userId),
        userName,
        content,
        messageType,
        conversationId: conversationId || generateGuid(),
        sentAt,
        groupId,
        assignmentId,
      };

      appendUiMessage({
        id: messageId,
        role: "user",
        content,
        createdAt: sentAt,
        messageType,
        crawlJobId: null,
      });

      try {
        await sendCrawlerMessage(rawPayload);
      } catch (err: any) {
        console.error("[CrawlerPage] send chat error:", err);
        pendingOutgoingRef.current = pendingOutgoingRef.current.filter(
          (pending) =>
            !(
              pending.content === content &&
              pending.conversationId === conversationId &&
              pending.messageType === messageType
            )
        );
        setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
        toast.error(err?.message || "Failed to send message");
      } finally {
        setChatSending(false);
      }
    },
    [
      appendUiMessage,
      assignmentId,
      chatConnected,
      chatInput,
      conversationId,
      groupId,
      sendCrawlerMessage,
      userId,
      userName,
    ]
  );

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      <main className="mx-auto flex max-w-7xl flex-col gap-4 py-6" data-tour="crawler-layout">
        <div className="flex items-start gap-3" data-tour="crawler-header">
          <div className="flex-1">
            <CrawlerAssignmentHeader
              assignment={assignment}
              loading={assignmentLoading}
              chatConnected={chatConnected}
              chatConnecting={chatConnecting}
              crawlConnected={crawlConnected}
              crawlConnecting={crawlConnecting}
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[230px]" data-tour="crawler-history">
            <button
              type="button"
              onClick={() => setShowAssignmentDrawer(true)}
              className="action-pill btn-blue-slow action-pill-solid action-pill-slide"
            >
              Assignment info
            </button>
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(true)}
              className="action-pill btn-green-slow action-pill-solid action-pill-slide"
            >
              History
            </button>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <div data-tour="crawler-config">
            <CrawlerUrlPromptSection
              url={url}
              prompt={prompt}
              onUrlChange={setUrl}
              onPromptChange={setPrompt}
              onStartCrawl={handleStartCrawl}
              submitting={submitting}
              chatConnected={chatConnected}
              crawlConnected={crawlConnected}
              assignmentId={assignmentId}
              promptUsed={promptUsed}
              isCrawling={isCrawling}
              progress={crawlProgress}
              statusMessage={crawlStatusMsg}
            />
          </div>

          <div className="grid gap-4 items-start">
            <CrawlerChatSection
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChatInputChange={setChatInput}
              onSendChat={handleSendChatMessage}
              chatSending={chatSending}
              chatConnected={chatConnected}
              onOpenResults={() => setShowResultsModal(true)}
              resultsAvailable={
                resultsLoading ||
                results.length > 0 ||
                jobHistory.length > 0
              }
            />
          </div>
        </section>
      </main>

      {showResultsModal && (
        <div className="fixed inset-0 z-[9999]" data-tour="crawler-results">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowResultsModal(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative flex w-full max-w-6xl max-h-[90vh] flex-col rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  Crawled Data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenDataPage}
                    disabled={!activeJobId}
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--foreground)] shadow-sm hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open data in new page
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResultsModal(false)}
                    className="rounded-lg p-1.5 hover:bg-red-50 transition"
                    title="Close"
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-50/40 p-4">
                <CrawlerResultsSection
                  results={results}
                  resultsLoading={resultsLoading}
                  historyIndex={historyIndex}
                  currentSummary={currentHistoryEntry?.summary || undefined}
                  currentPrompt={currentHistoryEntry?.prompt || undefined}
                  jobHistory={jobHistory}
                  onSelectHistoryIndex={handleSelectHistoryIndex}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistoryDrawer && (
        <div className="fixed inset-0 z-[9998]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setShowHistoryDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl border-r border-[var(--border)] flex flex-col z-10 slide-in-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                History
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-muted)] hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex-1">
              <CrawlerAssignmentConversationsSection
                conversations={conversations}
                loading={conversationsLoading || conversationMessagesLoading}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          </div>
        </div>
      )}

      {showAssignmentDrawer && (
        <div className="fixed inset-0 z-[9997]">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setShowAssignmentDrawer(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl border-l border-[var(--border)] flex flex-col z-10 slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                Assignment details
              </div>
              <button
                type="button"
                onClick={() => setShowAssignmentDrawer(false)}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-muted)] hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <CrawlerAssignmentDescription
                assignment={assignment}
                loading={assignmentLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CrawlerPage = () => (
  <Suspense>
    <CrawlerInner />
  </Suspense>
);

export default CrawlerPage;
