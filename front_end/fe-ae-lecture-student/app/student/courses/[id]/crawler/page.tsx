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
import {
  SUMMARY_KEYWORDS,
  generateGuid,
  isIgnorableSignalRError,
  makeId,
  buildUserIdentity,
  safeValidateUrl,
} from "@/utils/crawler-helpers";

const CrawlerInner = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const assignmentId = searchParams.get("assignmentId");
  const groupId = searchParams.get("groupId");

  const courseSlug = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("courses");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return "";
  }, [pathname]);

  // ===== User Info =====
  const { user } = useAuth() as any;
  const decodedUser = useDecodedUser();
  const { userId, userName } = buildUserIdentity(decodedUser, user);

  const getAccessToken = useCallback(() => {
    const token = getSavedAccessToken();
    return token || "";
  }, []);

  // Conversation ID (Client-side Lazy ID)
 const [conversationId, setConversationId] = useState<string>(() => generateGuid());


  // ===== Assignment Data =====
  const {
    data: assignmentRes,
    loading: assignmentLoading,
    fetchAssignment,
  } = useAssignmentById();

  const assignment = assignmentRes?.assignment;

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignment(assignmentId);
  }, [assignmentId]);

  // ===== Conversations History =====
  const {
    fetchAssignmentConversations,
    loading: conversationsLoading,
    conversations,
  } = useCrawlerAssignmentConversations();

  const {
    fetchConversationMessages,
    loading: conversationMessagesLoading,
  } = useCrawlerConversationMessages();

  const mapMessagesToUi = useCallback(
    (res: any[]): UiMessage[] => {
      return res.map((m) => {
        const mt = m.messageType as unknown as MessageType;
        return {
          id: m.messageId,
          role:
            mt === MessageType.AiSummary
              ? "assistant"
              : m.userId === userId
              ? "user"
              : "assistant",
          content: m.content,
          createdAt: m.timestamp ?? new Date().toISOString(),
          messageType: mt,
          crawlJobId: m.crawlJobId ?? undefined,
          visualizationData: m.visualizationData,
          extractedData: m.extractedData,
        };
      });
    },
    [userId]
  );

  // Fetch job metadata (e.g., conversationName)
  const { fetchJob } = useSmartCrawlerJob();
  const appendUiMessage = useCallback((msg: UiMessage) => {
    setChatMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msg.id);
      if (idx !== -1) {
        const merged: UiMessage = {
          ...prev[idx],
          ...msg,
          createdAt: msg.createdAt || prev[idx].createdAt,
        };
        const next = [...prev];
        next[idx] = merged;
        return next;
      }
      return [...prev, msg];
    });
  }, []);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const joinedConversationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignmentConversations(assignmentId, { myOnly: true }).catch((err) =>
      console.error("[Crawler] fetchAssignmentConversations error:", err)
    );
  }, [assignmentId, fetchAssignmentConversations]);

  // ===== Crawl Form State =====
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // ===== OVERLAY & PROGRESS STATE (NEW) =====
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlStatusMsg, setCrawlStatusMsg] = useState("");

  // ===== Chat State =====
  const [chatMessages, setChatMessages] = useState<UiMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showAssignmentDrawer, setShowAssignmentDrawer] = useState(false);
  const handleOpenDataPage = useCallback(() => {
    if (!activeJobId) return;
    const courseSegment = courseSlug || assignmentId || "unknown";
    const href = `/student/courses/${courseSegment}/crawler/data?jobId=${activeJobId}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }, [activeJobId, assignmentId, courseSlug]);
  const pendingOutgoingRef = useRef<
    { content: string; conversationId: string | null; messageType?: MessageType }[]
  >([]);

  // UI Toggle
  const [showAnalysis, setShowAnalysis] = useState(true);

  // ===== Results Hook =====
  const {
    fetchJobResults,
    loading: resultsLoading,
    results,
  } = useSmartCrawlerJobResults();

  const promptUsed = useMemo(() => {
    if (!results?.length) return "";
    return results[0]?.promptUsed || "";
  }, [results]);

  // Reload conversation messages (used after crawl completes or manual select)
  const syncConversationMessages = useCallback(
    async (convId: string | null) => {
      if (!convId) return;
      try {
        const res = await fetchConversationMessages(convId, { limit: 100, offset: 0 });
        if (!res) return;

        const mappedMessages = mapMessagesToUi(res);
        setChatMessages(mappedMessages);

        const jobMsg = res.find((m) => m.crawlJobId);
        if (!jobMsg?.crawlJobId) {
          setActiveJobId(null);
          return;
        }

        const jid = jobMsg.crawlJobId;
        setActiveJobId(jid);

        try {
          await fetchJobResults(jid);
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        console.error("[Crawler] syncConversationMessages error:", err);
      }
    },
    [fetchConversationMessages, fetchJobResults, mapMessagesToUi]
  );

  // ===== CrawlHub (Jobs) =====
  const {
    connected: crawlConnected,
    connecting: crawlConnecting,
    lastError: crawlError,
    connect: connectCrawl,
    disconnect: disconnectCrawl,
    subscribeToJob,
    subscribeToAssignmentJobs,
    subscribeToGroupJobs,
  } = useCrawlHub({
    getAccessToken,
    onConnectedChange: () => {},

    // 1. Job Started
    onJobStarted: (data) => {
      const jid = data?.jobId || data?.JobId;
      if (jid && activeJobId && jid !== activeJobId) return;

      setCrawlStatusMsg("Crawler started...");
      setCrawlProgress(10);
    },

    // 2. Job Progress
    onJobProgress: (data) => {
      const jid = data?.jobId || data?.JobId;
      if (jid && activeJobId && jid !== activeJobId) return;

      if (data.progress || data.progressPercentage) {
        setCrawlProgress(data.progress || data.progressPercentage || 0);
      }
      if (data.message) {
        setCrawlStatusMsg(data.message);
      }
    },

    // 3. Job Completed
    onJobCompleted: async (payload: any) => {
      const jid: string =
        payload?.jobId || payload?.JobId || payload?.jobID || "";

      setCrawlProgress(100);
      setCrawlStatusMsg("Finalizing results...");

      if (!jid) {
        setIsCrawling(false);
        setSubmitting(false);
        return;
      }

      setActiveJobId(jid);

      setTimeout(async () => {
        try {
          await fetchJobResults(jid);
          // Fetch job metadata (e.g., conversationName) and refresh history list
          await fetchJob(jid);
          if (assignmentId) {
            await fetchAssignmentConversations(assignmentId, { myOnly: true });
          }
          await syncConversationMessages(conversationId);
        } catch (err) {
          console.error("[CrawlerWorkspace] fetchJobResults/fetchJob error:", err);
        } finally {
          setIsCrawling(false);
          setSubmitting(false);
        }
      }, 800);
    },

    onError: (msg) => {
      if (!isIgnorableSignalRError(msg)) {
        console.error("[CrawlHub] error:", msg);
        if (isCrawling) {
          setIsCrawling(false);
          setSubmitting(false);
          toast.error("Connection interrupted. Please try again.");
        }
      }
    },
  });

  const pushUiMessageFromDto = useCallback(
    async (message: ChatMessageDto) => {
      // Skip echoing back messages we already showed optimistically
      if (
        message.userId &&
        message.userId === userId &&
        (message.messageType === MessageType.UserMessage ||
          message.messageType === MessageType.FollowUpQuestion ||
          message.messageType === MessageType.CrawlRequest)
      ) {
        const contentNormalized = (message.content || "").trim();
        const convId = message.conversationId || null;
        const pendingIdx = pendingOutgoingRef.current.findIndex(
          (p) =>
            p.content === contentNormalized &&
            p.conversationId === convId &&
            p.messageType === message.messageType
        );
        if (pendingIdx !== -1) {
          pendingOutgoingRef.current.splice(pendingIdx, 1);
          return;
        }
      }

      const role: UiMessage["role"] =
        message.messageType === MessageType.SystemNotification
          ? "system"
          : message.messageType === MessageType.AiSummary
          ? "assistant"
          : message.userId && message.userId === userId
          ? "user"
          : "assistant";

      const createdAt = message.timestamp || new Date().toISOString();

      const ui: UiMessage = {
        id: message.messageId || makeId(),
        role,
        content: message.content,
        createdAt,
        messageType: message.messageType,
        crawlJobId: message.crawlJobId,
        visualizationData: (message as any).visualizationData,
        extractedData: (message as any).extractedData,
      };

      appendUiMessage(ui);

      // When backend updates the same messageId with extractedData/visualizationData (CrawlResult/AiSummary),
      // refetch conversation + results to ensure UI shows latest without F5.
      const isResultMessage =
        message.messageType === MessageType.CrawlResult ||
        message.messageType === MessageType.AiSummary;
      const jid = message.crawlJobId;
      const convId = message.conversationId || conversationId;
      if (isResultMessage && jid && convId) {
        setActiveJobId(jid);
        try {
          await fetchJobResults(jid);
        } catch (err) {
          console.error("[CrawlerWorkspace] fetchJobResults on pushUiMessageFromDto error:", err);
        }
        await syncConversationMessages(convId);
      }
    },
    [userId, appendUiMessage, conversationId, fetchJobResults, syncConversationMessages]
  );

  // ===== ChatHub (Realtime) =====
  const {
    connected: chatConnected,
    connecting: chatConnecting,
    lastError: chatError,
    connect: connectChat,
    disconnect: disconnectChat,
    subscribeToAssignment,
    joinGroupWorkspace,
    joinConversation,
    leaveConversation,
    sendCrawlerMessage,
  } = useCrawlerChatHub({
    getAccessToken,
    onUserMessageReceived: (message) => pushUiMessageFromDto(message),
    onGroupMessageReceived: (message) => pushUiMessageFromDto(message),
    onCrawlInitiated: async (data) => {
      const jid = data.crawlJobId;
      if (!jid) return;

      setActiveJobId(jid);

      setCrawlStatusMsg("Job queued successfully...");
      setCrawlProgress(5);

      try {
        await subscribeToJob(jid);
      } catch (err) {
        console.error("[CrawlHub] subscribeToJob error:", err);
      }
    },
    onError: (msg) => {
      if (!isIgnorableSignalRError(msg)) {
        console.error("[CrawlerChatHub] error:", msg);
      }
    },
  });

  // ===== Lifecycle: Connect Hubs =====
  useEffect(() => {
    let isMounted = true;
    const initHubs = async () => {
      await new Promise((r) => setTimeout(r, 0));
      if (!isMounted) return;
      try {
        await connectChat();
        await connectCrawl();
      } catch (err) {
        if (isMounted) console.error("Failed to connect hubs:", err);
      }
    };
    initHubs();
    return () => {
      isMounted = false;
      disconnectChat().catch(() => {});
      disconnectCrawl().catch(() => {});
    };
  }, []);

  // ===== Lifecycle: Join Groups & Subscribe Jobs =====
  useEffect(() => {
    if (!chatConnected || !assignmentId) return;
    let isSubscribed = true;
    (async () => {
      try { await subscribeToAssignment(assignmentId); } catch (err) { if(isSubscribed) console.error(err); }
      if (groupId) { try { await joinGroupWorkspace(groupId); } catch (err) { if(isSubscribed) console.error(err); } }
    })();
    return () => { isSubscribed = false; };
  }, [chatConnected, assignmentId, groupId, subscribeToAssignment, joinGroupWorkspace]);

  useEffect(() => {
    if (!chatConnected || !conversationId) return;
    let cancelled = false;

    (async () => {
      try {
        const prev = joinedConversationRef.current;
        if (prev && prev !== conversationId) {
          try {
            await leaveConversation(prev);
          } catch (err) {
            if (!cancelled && !isIgnorableSignalRError(err)) {
              console.error("[CrawlerChatHub] leaveConversation error:", err);
            }
          }
        }

        await joinConversation(conversationId);
        if (!cancelled) {
          joinedConversationRef.current = conversationId;
        }
      } catch (err) {
        if (!cancelled && !isIgnorableSignalRError(err)) {
          console.error("[CrawlerChatHub] joinConversation error:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatConnected, conversationId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!crawlConnected || !assignmentId) return;
    let isSubscribed = true;
    (async () => {
      try { await subscribeToAssignmentJobs(assignmentId); } catch (err) { if(isSubscribed) console.error(err); }
      if (groupId) { try { await subscribeToGroupJobs(groupId); } catch (err) { if(isSubscribed) console.error(err); } 
}
    })();
    return () => { isSubscribed = false; };
  }, [crawlConnected, assignmentId, groupId, subscribeToAssignmentJobs, subscribeToGroupJobs]);

  // ===== Handle History Select =====
  const handleSelectConversation = useCallback(
    async (convId: string) => {
      if (!convId) return;

      setIsCrawling(false);
      setCrawlProgress(0);

      setSelectedConversationId(convId);
      setConversationId(convId);
      setShowHistoryDrawer(false);

      await syncConversationMessages(convId);
    },
    [syncConversationMessages]
  );

  // ===== Action: Start Crawl =====
  const handleStartCrawl = async () => {
  const trimmedUrl = url.trim();
  const trimmedPrompt = prompt.trim();

  if (!trimmedUrl) return toast.error("Please enter a URL first.");
  if (!trimmedPrompt) return toast.error("Please describe what you want to extract.");
  if (!safeValidateUrl(trimmedUrl)) return toast.error("Invalid URL.");
  if (!chatConnected) return toast.error("Chat connection is establishing... Please wait.");
  if (!assignmentId) return toast.error("Missing assignmentId. Please reload from assignment context.");
  if (!userId) return toast.error("UserId not found. Please reload.");

  setSubmitting(true);
  setIsCrawling(true);
  setCrawlStatusMsg("Initiating crawl request...");
  setCrawlProgress(0);

  const normalizedGroupId =
    groupId &&
    groupId !== "demo" &&
    groupId !== "null" &&
    groupId !== "undefined"
      ? groupId.toString()
      : null;
  const normalizedAssignmentId =
    assignmentId && assignmentId !== "demo" ? assignmentId.toString() : null;
  const normalizedUserId = String(userId);

  // ƒsÿ‹,? Payload kiểu "thật" y chang file HTML
  const rawPayload: any = {
    messageId: generateGuid(),
    conversationId: conversationId?.toString() || generateGuid(), // ensure string
    userId: normalizedUserId,
    userName,
    content: `${trimmedPrompt} | ${trimmedUrl}`, // "prompt | url"
    messageType: 1, // CrawlRequest
    timestamp: new Date().toISOString(),
  };
  rawPayload.groupId = normalizedGroupId ?? null;
  rawPayload.assignmentId = normalizedAssignmentId ?? null;

  try {
    await sendCrawlerMessage(rawPayload as ChatMessageDto);
    appendUiMessage({
      id: rawPayload.messageId,
      role: "user",
      content: rawPayload.content,
      createdAt: rawPayload.timestamp,
      messageType: MessageType.CrawlRequest,
      crawlJobId: null,
    });
    setUrl("");
    setPrompt("");
  } catch (err: any) {
    console.error("[CrawlerWorkspace] sendCrawlerMessage error:", err);
    toast.error(err?.message || "Failed to send crawl request");
    setIsCrawling(false);
    setSubmitting(false);
  }
};


  // ===== Action: Send Chat =====
  const handleSendChatMessage = async (contentOverride?: string) => {
    const content = (contentOverride ?? chatInput).trim();
    if (!content) return;
    if (!chatConnected) return;
    const normalizedContent = content.toLowerCase();
    const shouldMarkFollowUp = SUMMARY_KEYWORDS.some((keyword) =>
      normalizedContent.includes(keyword)
    );
    const messageType = shouldMarkFollowUp
      ? MessageType.FollowUpQuestion
      : MessageType.UserMessage;

    pendingOutgoingRef.current.push({
      content,
      conversationId,
      messageType,
    });

    setChatInput("");
    setChatSending(true);

    const normalizedGroupId =
      groupId &&
      groupId !== "demo" &&
      groupId !== "null" &&
      groupId !== "undefined"
        ? groupId.toString()
        : null;
    const normalizedAssignmentId =
      assignmentId && assignmentId !== "demo" ? assignmentId.toString() : null;
    const normalizedUserId = String(userId);
    const messageId = generateGuid();
    const sentAt = new Date().toISOString();

    // ’'sA¨ƒ?1,? G ¯-i d §­ng format nh’ø HTML test page
    const rawPayload: any = {
      messageId,
      userId: normalizedUserId,
      userName,
      content,
      messageType,
      conversationId: conversationId?.toString() || generateGuid(),
      sentAt,
    };
    rawPayload.groupId = normalizedGroupId ?? null;
    rawPayload.assignmentId = normalizedAssignmentId ?? null;

    appendUiMessage({
      id: rawPayload.messageId,
      role: "user",
      content: rawPayload.content,
      createdAt: rawPayload.sentAt,
      messageType,
      crawlJobId: null,
    });

    try {
      await sendCrawlerMessage(rawPayload as ChatMessageDto);
    } catch (err: any) {
      console.error("[CrawlerWorkspace] sendCrawlerMessage error:", err);
      pendingOutgoingRef.current = pendingOutgoingRef.current.filter(
        (p) =>
          !(
            p.content === content &&
            p.conversationId === conversationId &&
            p.messageType === messageType
          )
      );
      setChatMessages((prev) => prev.filter((m) => m.id !== rawPayload.messageId));
      toast.error(err?.message || "Failed to send message");
    } finally {
      setChatSending(false);
    }
  };


  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      <main
        className="mx-auto flex max-w-7xl flex-col gap-4 py-6"
        data-tour="crawler-layout"
      >
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

          <div className="card p-4" data-tour="crawler-results">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                Crawled Data
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenDataPage}
                  disabled={!activeJobId}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--foreground)] shadow-sm hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Open data in new page
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnalysis((prev) => !prev)}
                  className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:bg-slate-50 transition"
                >
                  {showAnalysis ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {showAnalysis && (
              <div className="min-h-[340px]">
                <CrawlerResultsSection results={results} resultsLoading={resultsLoading} />
              </div>
            )}
          </div>

          <div className="grid gap-4 items-start">
            <CrawlerChatSection
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChatInputChange={setChatInput}
              onSendChat={handleSendChatMessage}
              chatSending={chatSending}
              chatConnected={chatConnected}
            />
          </div>
        </section>
      </main>

      {/* History Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-[9998]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setShowHistoryDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl border-r border-[var(--border)] flex flex-col z-10 slide-in-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--foreground)]">History</div>
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

      {/* Assignment Drawer */}
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
              <CrawlerAssignmentDescription assignment={assignment} loading={assignmentLoading} />
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
