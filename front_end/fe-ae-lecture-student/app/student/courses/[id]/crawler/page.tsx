"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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
import CrawlerChatSection from "./components/CrawlerChatSection";
import CrawlerAssignmentHeader from "./components/CrawlerAssignmentHeader";
import CrawlerAssignmentDescription from "./components/CrawlerAssignmentDescription";
import CrawlerAssignmentConversationsSection from "./components/CrawlerAssignmentConversationsSection";
import CrawlerUploadCsvController from "./components/CrawlerUploadCsvController";
import CrawlerQuotaExceededDialog from "./components/CrawlerQuotaExceededDialog";
import CrawlerResultsModal from "./components/CrawlerResultsModal";
import { useCrawlerConversationState } from "./hooks/useCrawlerConversationState";
import useEventCallback from "./hooks/useEventCallback";
import { useCrawlJobHandlers } from "./hooks/useCrawlJobHandlers";
import {
  generateGuid,
  isIgnorableSignalRError,
  makeId,
  buildUserIdentity,
  safeValidateUrl,
} from "@/utils/crawler-helpers";
import type { CrawlerChatConversationItem } from "@/types/crawler-chat/crawler-chat.response";

const INVALID_SCOPE_VALUES = new Set(["", "null", "undefined", "demo"]);
const HISTORY_REFRESH_DELAY_MS = 5000;
const HISTORY_REFRESH_MAX_ATTEMPTS = 3;
const RECENT_MESSAGE_WINDOW_MS = 4000;

const sanitizeScopeValue = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (INVALID_SCOPE_VALUES.has(trimmed.toLowerCase())) return null;
  return trimmed;
};

const parseTimestampToMs = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

type PendingMessage = {
  content: string;
  conversationId: string | null;
  messageType?: MessageType;
};

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

  const backToAssignmentHref =
    assignmentId && courseSlug
      ? `/student/courses/${courseSlug}/assignments/${assignmentId}`
      : undefined;

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
  const pendingCrawlRequestRef = useRef<{
    messageId: string;
    content: string;
    conversationId: string;
    timestamp: string;
  } | null>(null);
  const chatMessagesRef = useRef<UiMessage[]>([]);

  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [crawlTargetUrl, setCrawlTargetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlStatusMsg, setCrawlStatusMsg] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [historyRefreshLoading, setHistoryRefreshLoading] = useState(false);
  const historyRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRefreshRequestRef = useRef(0);
  const historyRefreshTargetRef = useRef<string | null>(null);
  const [historyRefreshTargetId, setHistoryRefreshTargetId] = useState<string | null>(null);

  const [showAssignmentDrawer, setShowAssignmentDrawer] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

  const {
    data: assignmentRes,
    loading: assignmentLoading,
    fetchAssignment,
  } = useAssignmentById();
  const assignment = assignmentRes?.assignment;

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignment(assignmentId).catch(() => {});
  }, [assignmentId, fetchAssignment]);

  useEffect(() => {
    return () => {
      if (historyRefreshTimeoutRef.current) {
        clearTimeout(historyRefreshTimeoutRef.current);
      }
    };
  }, []);

  const isDialogOpen = quotaDialogOpen || showAssignmentDrawer || isCrawling;

  useEffect(() => {
    if (!isDialogOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isDialogOpen]);

  const {
    fetchAssignmentConversations,
    loading: conversationsLoading,
    conversations,
  } = useCrawlerAssignmentConversations();

  const { fetchConversationMessages } = useCrawlerConversationMessages();

  const { fetchJob } = useSmartCrawlerJob();
  const {
    fetchJobResults,
    fetchAllJobResults,
    loading: resultsLoading,
    results,
    clearResults,
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
    startNewConversation,
  } = useCrawlerConversationState({
    fetchConversationMessages,
    fetchJobResults: fetchAllJobResults, // Sử dụng fetchAllJobResults để lấy tất cả kết quả
    userId,
    resultsLoading,
  });

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  const promptUsed = useMemo(() => {
    if (!results?.length) return "";
    return results[0]?.promptUsed || "";
  }, [results]);

  const chatReady =
    Boolean(selectedConversationId) ||
    isCrawling ||
    Boolean(activeJobId) ||
    jobHistory.length > 0 ||
    chatMessages.length > 0;

  const extractUrlFromContent = useCallback((content?: string | null) => {
    if (!content) return null;
    const segments = content.split("|");
    const candidate = segments[segments.length - 1]?.trim();
    if (!candidate) return null;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (candidate.includes("://")) return candidate;
    return null;
  }, []);

  const isConversationInHistory = useCallback(
    (targetId: string) => conversations.some((item) => item.conversationId === targetId),
    [conversations]
  );

  const isConversationHistoryReady = useCallback(
    (items: CrawlerChatConversationItem[] | null, targetConversationId: string | null) => {
      if (!targetConversationId) return true;
      if (!items?.length) return false;
      const match = items.find((item) => item.conversationId === targetConversationId);
      if (!match) return false;
      const name = match.conversationName?.trim();
      return Boolean(name);
    },
    []
  );

  const refreshAssignmentHistory = useCallback(
    async (targetAssignmentId: string, args: { myOnly: boolean }) => {
      if (!targetAssignmentId) return null;

      historyRefreshRequestRef.current += 1;
      const requestId = historyRefreshRequestRef.current;

      if (historyRefreshTimeoutRef.current) {
        clearTimeout(historyRefreshTimeoutRef.current);
        historyRefreshTimeoutRef.current = null;
      }

      const result = await fetchAssignmentConversations(targetAssignmentId, args);

      if (requestId !== historyRefreshRequestRef.current) {
        return result;
      }

      const targetConversationId = historyRefreshTargetRef.current;
      if (!targetConversationId) {
        setHistoryRefreshLoading(false);
        setHistoryRefreshTargetId(null);
        return result;
      }

      if (isConversationHistoryReady(result, targetConversationId)) {
        setHistoryRefreshLoading(false);
        historyRefreshTargetRef.current = null;
        setHistoryRefreshTargetId(null);
        return result;
      }

      setHistoryRefreshLoading(true);

      const scheduleRetry = (attempt: number) => {
        if (attempt > HISTORY_REFRESH_MAX_ATTEMPTS) {
          setHistoryRefreshLoading(false);
          historyRefreshTargetRef.current = null;
          setHistoryRefreshTargetId(null);
          return;
        }

        historyRefreshTimeoutRef.current = setTimeout(() => {
          void (async () => {
            try {
              const retryResult = await fetchAssignmentConversations(targetAssignmentId, args);
              if (requestId !== historyRefreshRequestRef.current) {
                return;
              }
              if (historyRefreshTargetRef.current !== targetConversationId) {
                return;
              }
              if (isConversationHistoryReady(retryResult, targetConversationId)) {
                setHistoryRefreshLoading(false);
                historyRefreshTargetRef.current = null;
                setHistoryRefreshTargetId(null);
                return;
              }
              if (attempt >= HISTORY_REFRESH_MAX_ATTEMPTS) {
                setHistoryRefreshLoading(false);
                historyRefreshTargetRef.current = null;
                setHistoryRefreshTargetId(null);
                return;
              }
              scheduleRetry(attempt + 1);
            } catch {
              if (requestId !== historyRefreshRequestRef.current) {
                return;
              }
              if (historyRefreshTargetRef.current !== targetConversationId) {
                return;
              }
              if (attempt >= HISTORY_REFRESH_MAX_ATTEMPTS) {
                setHistoryRefreshLoading(false);
                historyRefreshTargetRef.current = null;
                setHistoryRefreshTargetId(null);
              } else {
                scheduleRetry(attempt + 1);
              }
            }
          })();
        }, HISTORY_REFRESH_DELAY_MS);
      };

      scheduleRetry(2);

      return result;
    },
    [
      fetchAssignmentConversations,
      isConversationHistoryReady,
    ]
  );

  const isQuotaExceededError = useCallback((error?: string) => {
    if (!error) return false;
    const normalized = error.toLowerCase();
    return (
      normalized.includes("quota") ||
      normalized.includes("limit") ||
      normalized.includes("upgrade your plan")
    );
  }, []);

  const handleSelectConversation = useCallback(
    (convId: string) => {
      if (!convId) return;

      setIsCrawling(false);
      setCrawlProgress(0);

      void (async () => {
        const jobIdFromHistory = await selectConversation(convId);
        if (jobIdFromHistory) {
          await fetchAllJobResults(jobIdFromHistory);
        }
      })();
    },
    [fetchAllJobResults, selectConversation]
  );

  const handleNewConversation = useCallback(() => {
    startNewConversation();
    setIsCrawling(false);
    setCrawlProgress(0);
    setChatInput("");
    clearResults();
  }, [clearResults, startNewConversation]);

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignmentConversations(assignmentId, { myOnly: true }).catch(() => {});
  }, [assignmentId, fetchAssignmentConversations]);

  useEffect(() => {
    if (!historyRefreshLoading) return;
    const targetConversationId = historyRefreshTargetRef.current;
    if (!targetConversationId) {
      setHistoryRefreshLoading(false);
      return;
    }
    if (!isConversationHistoryReady(conversations, targetConversationId)) return;
    historyRefreshTargetRef.current = null;
    setHistoryRefreshTargetId(null);
    setHistoryRefreshLoading(false);
    if (historyRefreshTimeoutRef.current) {
      clearTimeout(historyRefreshTimeoutRef.current);
      historyRefreshTimeoutRef.current = null;
    }
  }, [conversations, historyRefreshLoading, isConversationHistoryReady]);

  const findRecentMessageIndex = useCallback(
    ({
      role,
      content,
      messageType,
      timestampMs,
    }: {
      role: UiMessage["role"];
      content: string;
      messageType?: MessageType;
      timestampMs: number | null;
    }) => {
      if (!timestampMs) return -1;
      const normalized = content.trim();
      if (!normalized) return -1;
      const items = chatMessagesRef.current;
      for (let i = items.length - 1; i >= 0; i -= 1) {
        const msg = items[i];
        if (msg.role !== role) continue;
        if (messageType !== undefined && msg.messageType !== messageType) continue;
        if ((msg.content || "").trim() !== normalized) continue;
        const existingMs = Date.parse(msg.createdAt);
        if (Number.isNaN(existingMs)) continue;
        if (Math.abs(existingMs - timestampMs) <= RECENT_MESSAGE_WINDOW_MS) {
          return i;
        }
      }
      return -1;
    },
    []
  );

  const pushUiMessageFromDto = useCallback(
    async (message: ChatMessageDto) => {
      const normalizedContent = (message.content || "").trim();
      const messageType =
        message.messageType ?? MessageType.UserMessage;
      const incomingTimestampMs = parseTimestampToMs(message.timestamp ?? message.sentAt);

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
        }
      }

      const normalizedUserId = userId != null ? String(userId) : null;
      const isUserMessage =
        normalizedUserId !== null &&
        String(message.userId) === normalizedUserId;
      const role: UiMessage["role"] = isUserMessage
        ? "user"
        : messageType === MessageType.SystemNotification
        ? "system"
        : "assistant";

      const pendingCrawl = pendingCrawlRequestRef.current;
      if (
        role === "user" &&
        messageType === MessageType.CrawlRequest &&
        pendingCrawl &&
        pendingCrawl.content.trim() === normalizedContent
      ) {
        return;
      }

      if (role === "user") {
        const duplicateIdx = findRecentMessageIndex({
          role,
          content: normalizedContent,
          messageType,
          timestampMs: incomingTimestampMs,
        });
        if (duplicateIdx !== -1) {
          setChatMessages((prev) => {
            let updated = false;
            const next = prev.map((msg) => {
              if (updated) return msg;
              if (msg.role !== role) return msg;
              if ((msg.content || "").trim() !== normalizedContent) return msg;
              if (messageType !== undefined && msg.messageType !== messageType) return msg;
              if (incomingTimestampMs !== null) {
                const existingMs = Date.parse(msg.createdAt);
                if (
                  Number.isNaN(existingMs) ||
                  Math.abs(existingMs - incomingTimestampMs) > RECENT_MESSAGE_WINDOW_MS
                ) {
                  return msg;
                }
              }
              updated = true;
              return {
                ...msg,
                id: message.messageId || msg.id,
                createdAt: message.timestamp || msg.createdAt,
                messageType,
                crawlJobId: message.crawlJobId ?? msg.crawlJobId,
                visualizationData: message.visualizationData ?? msg.visualizationData,
                extractedData: message.extractedData ?? msg.extractedData,
              };
            });
            return updated ? next : prev;
          });
          return;
        }
      }

      const uiMessage: UiMessage = {
        id: message.messageId || makeId(),
        role,
        content: message.content,
        createdAt: message.timestamp || new Date().toISOString(),
        messageType,
        crawlJobId: message.crawlJobId,
        visualizationData: message.visualizationData,
        extractedData: message.extractedData,
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
          await fetchAllJobResults(jobId); // Lấy tất cả kết quả với pagination
        } catch {
        }
        await reloadConversation({ jobIdOverride: jobId });
      }
    },
    [
      appendUiMessage,
      conversationId,
      fetchAllJobResults,
      findRecentMessageIndex,
      reloadConversation,
      setChatMessages,
      userId,
    ]
  );
  const {
    handleJobStarted,
    handleJobProgress,
    handleJobNavigation,
    handleJobPagination,
    handleJobExtraction,
    handleJobCompleted,
  } = useCrawlJobHandlers({
    activeJobId,
    assignmentId,
    setActiveJobId,
    setCrawlStatusMsg,
    setCrawlProgress,
    setIsCrawling,
    setSubmitting,
    setShowResultsModal,
    fetchJobResults: fetchAllJobResults, // Lấy tất cả kết quả với pagination
    fetchJob,
    fetchAssignmentConversations: refreshAssignmentHistory,
    reloadConversation,
  });

  const handleCrawlFailed = useCallback(
    (data: { error?: string }) => {
      const error = data?.error || "Crawl failed";
      setCrawlStatusMsg(error);
      setCrawlProgress(0);
      setIsCrawling(false);
      setSubmitting(false);

      const pending = pendingCrawlRequestRef.current;
      if (pending) {
        pendingOutgoingRef.current = pendingOutgoingRef.current.filter(
          (item) =>
            !(
              item.content === pending.content &&
              item.conversationId === pending.conversationId &&
              item.messageType === MessageType.CrawlRequest
            )
        );
        pendingCrawlRequestRef.current = null;
      }

      if (isQuotaExceededError(error)) {
        if (pending) {
          setChatMessages((prev) => prev.filter((m) => m.id !== pending.messageId));
        }
        setQuotaExceeded(true);
        setQuotaMessage(error);
        setQuotaDialogOpen(true);
      } else {
        toast.error(error);
      }
    },
    [isQuotaExceededError, setChatMessages]
  );

  const handleCrawlInitiated = useCallback(async (data: { crawlJobId: string; messageId?: string }) => {
    const jid = data.crawlJobId;
    if (!jid) return;

    setActiveJobId(jid);
    setCrawlStatusMsg("Job queued successfully...");
    setCrawlProgress(8);

    const pending = pendingCrawlRequestRef.current;
    if (pending && (!data.messageId || data.messageId === pending.messageId)) {
      const pendingTimestampMs = parseTimestampToMs(pending.timestamp);
      const duplicateIdx = findRecentMessageIndex({
        role: "user",
        content: pending.content,
        messageType: MessageType.CrawlRequest,
        timestampMs: pendingTimestampMs,
      });
      if (duplicateIdx === -1) {
        appendUiMessage({
          id: pending.messageId,
          role: "user",
          content: pending.content,
          createdAt: pending.timestamp,
          messageType: MessageType.CrawlRequest,
          crawlJobId: null,
        });
      }
      pendingOutgoingRef.current = pendingOutgoingRef.current.filter(
        (item) =>
          !(
            item.content === pending.content &&
            item.conversationId === pending.conversationId &&
            item.messageType === MessageType.CrawlRequest
          )
      );
      pendingCrawlRequestRef.current = null;
    }

    const subscribeFn = crawlJobSubscriptionRef.current;
    if (!subscribeFn) return;

    try {
      await subscribeFn(jid);
    } catch {
    }
  }, [
    appendUiMessage,
    findRecentMessageIndex,
    setActiveJobId,
    setCrawlProgress,
    setCrawlStatusMsg,
  ]);

  const handleCrawlHubError = useCallback(
    (message: string) => {
      if (!isIgnorableSignalRError(message)) {
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
    }
  }, []);

  const jobStartedHandler = useEventCallback(handleJobStarted);
  const jobProgressHandler = useEventCallback(handleJobProgress);
  const jobNavigationHandler = useEventCallback(handleJobNavigation);
  const jobPaginationHandler = useEventCallback(handleJobPagination);
  const jobExtractionHandler = useEventCallback(handleJobExtraction);
  const jobCompletedHandler = useEventCallback(handleJobCompleted);
  const crawlHubErrorHandler = useEventCallback(handleCrawlHubError);
  const crawlInitiatedHandler = useEventCallback(handleCrawlInitiated);
  const crawlFailedHandler = useEventCallback(handleCrawlFailed);
  const chatHubErrorHandler = useEventCallback(handleChatHubError);
  const pushUiMessageHandler = useEventCallback(pushUiMessageFromDto);

  const {
    connected: crawlConnected,
    connecting: crawlConnecting,
    subscribeToJob,
    subscribeToAssignmentJobs,
    subscribeToGroupJobs,
  } = useCrawlHub({
    getAccessToken,
    onJobStarted: jobStartedHandler,
    onJobProgress: jobProgressHandler,
    onJobCompleted: jobCompletedHandler,
    onJobNavigation: jobNavigationHandler,
    onJobPagination: jobPaginationHandler,
    onJobExtraction: jobExtractionHandler,
    onError: crawlHubErrorHandler,
  });

  crawlJobSubscriptionRef.current = subscribeToJob;

  const {
    connected: chatConnected,
    connecting: chatConnecting,
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
    onCrawlFailed: crawlFailedHandler,
    onError: chatHubErrorHandler,
  });

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

    if (quotaExceeded) {
      setQuotaDialogOpen(true);
      return;
    }

    if (!trimmedUrl) return toast.error("Please enter a URL first.");
    if (!trimmedPrompt) return toast.error("Please describe what you want to extract.");
    if (!safeValidateUrl(trimmedUrl)) return toast.error("Invalid URL.");
    if (!chatConnected) return toast.error("Chat connection is establishing... Please wait.");
    if (!userId) return toast.error("UserId not found. Please reload.");

    setSubmitting(true);
    setIsCrawling(true);
    setCrawlStatusMsg("Initiating crawl request...");
    setCrawlProgress(2);
    setCrawlTargetUrl(trimmedUrl);

    const payloadConversationId = conversationId || generateGuid();
    const normalizedUserId = String(userId);
    const shouldRefreshHistory = !isConversationInHistory(payloadConversationId);
    historyRefreshTargetRef.current = shouldRefreshHistory ? payloadConversationId : null;
    setHistoryRefreshTargetId(shouldRefreshHistory ? payloadConversationId : null);
    if (!shouldRefreshHistory) {
      setHistoryRefreshLoading(false);
    }

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

    pendingOutgoingRef.current.push({
      content: rawPayload.content,
      conversationId: payloadConversationId,
      messageType: MessageType.CrawlRequest,
    });

    pendingCrawlRequestRef.current = {
      messageId: rawPayload.messageId!,
      content: rawPayload.content,
      conversationId: payloadConversationId,
      timestamp: rawPayload.timestamp!,
    };

    try {
      await sendCrawlerMessage(rawPayload);
      setUrl("");
      setPrompt("");
    } catch (err: any) {
      pendingOutgoingRef.current = pendingOutgoingRef.current.filter(
        (item) =>
          !(
            item.content === rawPayload.content &&
            item.conversationId === payloadConversationId &&
            item.messageType === MessageType.CrawlRequest
          )
      );
      pendingCrawlRequestRef.current = null;
      toast.error(err?.message || "Failed to send crawl request");
      setIsCrawling(false);
      setSubmitting(false);
    }
  }, [
    assignmentId,
    chatConnected,
    conversationId,
    groupId,
    isConversationInHistory,
    prompt,
    quotaExceeded,
    sendCrawlerMessage,
    setQuotaDialogOpen,
    url,
    userId,
    userName,
  ]);

  const handleSendChatMessage = useCallback(
    async (contentOverride?: string) => {
      const content = (contentOverride ?? chatInput).trim();
      if (!content) return;
      if (!chatReady) return;
      if (!chatConnected) return;

      const isFirstConversationMessage = chatMessages.length === 0;
      const messageType = isFirstConversationMessage
        ? MessageType.CrawlRequest
        : MessageType.UserMessage;

      if (messageType === MessageType.CrawlRequest && quotaExceeded) {
        setQuotaDialogOpen(true);
        return;
      }

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

      if (messageType === MessageType.CrawlRequest) {
        const derivedUrl = extractUrlFromContent(content);
        if (derivedUrl) {
          setCrawlTargetUrl(derivedUrl);
        }
        const shouldRefreshHistory = !isConversationInHistory(rawPayload.conversationId);
        historyRefreshTargetRef.current = shouldRefreshHistory ? rawPayload.conversationId : null;
        setHistoryRefreshTargetId(shouldRefreshHistory ? rawPayload.conversationId : null);
        if (!shouldRefreshHistory) {
          setHistoryRefreshLoading(false);
        }
        pendingCrawlRequestRef.current = {
          messageId,
          content,
          conversationId: rawPayload.conversationId,
          timestamp: sentAt,
        };
      } else {
        appendUiMessage({
          id: messageId,
          role: "user",
          content,
          createdAt: sentAt,
          messageType,
          crawlJobId: null,
        });
      }

      try {
        await sendCrawlerMessage(rawPayload);
      } catch (err: any) {
        pendingOutgoingRef.current = pendingOutgoingRef.current.filter(
          (pending) =>
            !(
              pending.content === content &&
              pending.conversationId === conversationId &&
              pending.messageType === messageType
            )
        );
        if (messageType === MessageType.CrawlRequest) {
          pendingCrawlRequestRef.current = null;
        } else {
          setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
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
      chatReady,
      chatMessages.length,
      conversationId,
      extractUrlFromContent,
      groupId,
      sendCrawlerMessage,
      isConversationInHistory,
      userId,
      userName,
      quotaExceeded,
      setQuotaDialogOpen,
    ]
  );

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      <main className="mx-auto flex max-w-screen-2xl flex-col gap-4 py-6" data-tour="crawler-layout">
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
          <div className="flex flex-col gap-2 min-w-[230px]">
            {backToAssignmentHref && (
              <Link
                href={backToAssignmentHref}
                className="btn w-full bg-white border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to assignment
              </Link>
            )}
            {assignmentId && (
              <button
                type="button"
                onClick={() => setShowAssignmentDrawer(true)}
                className="action-pill btn-blue-slow action-pill-solid action-pill-slide"
              >
                Assignment info
              </button>
            )}
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
              promptUsed={promptUsed}
              activeTargetUrl={crawlTargetUrl}
              isCrawling={isCrawling}
              progress={crawlProgress}
              statusMessage={crawlStatusMsg}
            />
          </div>

          <div className="grid gap-4 items-start lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
            <div className="lg:sticky lg:top-4" data-tour="crawler-history">
              <CrawlerAssignmentConversationsSection
                conversations={conversations}
                loading={conversationsLoading}
                refreshingConversationId={
                  historyRefreshLoading ? historyRefreshTargetId : null
                }
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            </div>
            <CrawlerUploadCsvController
              conversationId={conversationId}
              reloadConversation={reloadConversation}
            >
              {({ onUploadCsv, uploadingCsv }) => (
                <CrawlerChatSection
                  chatMessages={chatMessages}
                  chatInput={chatInput}
                  onChatInputChange={setChatInput}
                  onSendChat={handleSendChatMessage}
                  onUploadCsv={onUploadCsv}
                  uploadingCsv={uploadingCsv}
                  chatSending={chatSending}
                  chatConnected={chatConnected}
                  chatReady={chatReady}
                  disableAutoScroll={isDialogOpen}
                  onOpenResults={() => setShowResultsModal(true)}
                  resultsAvailable={
                    resultsLoading ||
                    results.length > 0 ||
                    jobHistory.length > 0
                  }
                />
              )}
            </CrawlerUploadCsvController>
          </div>
        </section>
      </main>

      <CrawlerResultsModal
        open={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        activeJobId={activeJobId}
        conversationId={conversationId}
        courseSlug={courseSlug}
        assignmentId={assignmentId}
        results={results}
        resultsLoading={resultsLoading}
        historyIndex={historyIndex}
        currentSummary={currentHistoryEntry?.summary || undefined}
        currentPrompt={currentHistoryEntry?.prompt || undefined}
        jobHistory={jobHistory}
        onSelectHistoryIndex={handleSelectHistoryIndex}
      />

      <CrawlerQuotaExceededDialog
        open={quotaDialogOpen}
        onOpenChange={setQuotaDialogOpen}
        message={quotaMessage || undefined}
      />

      {showAssignmentDrawer && assignmentId && (
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
