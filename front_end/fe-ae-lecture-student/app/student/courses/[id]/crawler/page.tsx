"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

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

import type { CrawlSummary, UiMessage } from "./crawler-types";
import CrawlerUrlPromptSection from "./components/CrawlerUrlPromptSection";
import CrawlerResultsSection from "./components/CrawlerResultsSection";
import CrawlerChatSection from "./components/CrawlerChatSection";
import CrawlerAssignmentHeader from "./components/CrawlerAssignmentHeader";
import CrawlerAssignmentDescription from "./components/CrawlerAssignmentDescription";
import CrawlerAssignmentConversationsSection from "./components/CrawlerAssignmentConversationsSection";

/** Base URL for crawler service (REST) */
const CRAWLER_BASE_URL =
  process.env.NEXT_PUBLIC_CRAWLER_BASE_URL ||
  "https://crawl.fishmakeweb.id.vn";

/** Keywords used to detect follow-up questions that should trigger a summary */
const SUMMARY_KEYWORDS = [
  "summary",
  "summarize",
  "insight",
  "insights",
  "overview",
  "tóm tắt",
  "tổng quan",
  "phân tích",
  "gợi ý",
  "recommendation",
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Helper filter lỗi rác khi F5/Mạng yếu
const isIgnorableSignalRError = (msg: any) => {
  const errorString = String(msg || "");
  return (
    errorString.includes("Canceled") ||
    errorString.includes("Invocation canceled") ||
    errorString.includes("WebSocket closed") ||
    errorString.includes("AbortError") ||
    errorString.includes("connection is not in the 'Connected' state")
  );
};

const CrawlerInner = () => {
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const assignmentId = searchParams.get("assignmentId");
  const groupId = searchParams.get("groupId");

  // ===== User Info =====
  const { user } = useAuth() as any;
  const userId: string =
    user?.id || user?.userId || user?.userID || user?.UserId || "";
  const userName: string =
    user?.fullName ||
    user?.name ||
    user?.userName ||
    user?.email ||
    "Student";

  const getAccessToken = useCallback(() => {
    const token = getSavedAccessToken();
    return token || "";
  }, []);

  // Conversation ID (Client-side Lazy ID)
  const [conversationId, setConversationId] = useState<string>(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return makeId();
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

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
  const [crawlStatusMsg, setCrawlStatusMsg] = useState("Initializing...");

  // ===== Summary State =====
  const [summary, setSummary] = useState<CrawlSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // ===== Chat State =====
  const [chatMessages, setChatMessages] = useState<UiMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

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

  // ===== Create New Conversation Logic =====
  const handleCreateNewConversation = useCallback(() => {
    const newId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : makeId();

    console.log("✨ Starting new conversation (Client-side):", newId);

    // Reset UI immediately
    setConversationId(newId);
    setSelectedConversationId(null);
    setChatMessages([]);
    setChatInput("");
    setActiveJobId(null);
    setSummary(null);
    setSummaryError(null);
    setUrl("");
    setPrompt("");
    
    // Reset overlay state just in case
    setIsCrawling(false);
    setCrawlProgress(0);
  }, []);

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
      // Chỉ update nếu job id khớp (hoặc update chung cũng được)
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
      
      // Update UI Overlay to 100%
      setCrawlProgress(100);
      setCrawlStatusMsg("Finalizing results...");

      if (!jid) {
        setIsCrawling(false);
        setSubmitting(false);
        return;
      }

      setActiveJobId(jid);
      setSummary(null);

      // Delay a bit for animation, then fetch results and close overlay
      setTimeout(async () => {
        try {
          await fetchJobResults(jid);
        } catch (err) {
          console.error("[CrawlerWorkspace] fetchJobResults error:", err);
        } finally {
          setIsCrawling(false); // Tắt màn hình tối
          setSubmitting(false); // Mở lại nút
        }
      }, 800);
    },

    onError: (msg) => {
      if (!isIgnorableSignalRError(msg)) {
        console.error("[CrawlHub] error:", msg);
        // Nếu lỗi xảy ra khi đang crawl, phải tắt overlay để user ko bị kẹt
        if (isCrawling) {
          setIsCrawling(false);
          setSubmitting(false);
          alert("Connection interrupted. Please try again.");
        }
      }
    },
  });

  // ===== Helper: Fetch Summary =====
  const fetchSummaryForJob = useCallback(
    async (jobId: string, _opts?: { source?: "manual" | "keyword" }) => {
      const normalizedJobId = jobId.trim();
      if (!normalizedJobId) return;

      const token = getAccessToken();
      if (!token) {
        setSummaryError("Missing access token.");
        return;
      }

      setSummaryLoading(true);
      setSummaryError(null);

      try {
        const response = await fetch(
          `${CRAWLER_BASE_URL.replace(
            /\/+$/g,
            ""
          )}/api/analytics/jobs/${normalizedJobId}/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Summary request failed (${response.status})`);
        }

        const raw = await response.json();
        const mapped: CrawlSummary = {
          summaryText: raw.summaryText || raw.SummaryText || "",
          insightHighlights:
            raw.insightHighlights || raw.InsightHighlights || [],
          fieldCoverage:
            (raw.fieldCoverage || raw.FieldCoverage || []) as CrawlSummary["fieldCoverage"],
          chartPreviews:
            (raw.chartPreviews || raw.ChartPreviews || []) as CrawlSummary["chartPreviews"],
        };

        setSummary(mapped);
      } catch (err: any) {
        console.error("[CrawlerWorkspace] fetch summary error:", err);
        setSummaryError(err?.message || "Failed to load summary");
      } finally {
        setSummaryLoading(false);
      }
    },
    [getAccessToken]
  );

  const pushUiMessageFromDto = useCallback(
    (message: ChatMessageDto) => {
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
      };

      setChatMessages((prev) => [...prev, ui]);

      if (message.messageType === MessageType.AiSummary && message.crawlJobId) {
        fetchSummaryForJob(message.crawlJobId, { source: "keyword" }).catch(
          (err) => console.error("Auto summary fetch failed", err)
        );
      }
    },
    [userId, fetchSummaryForJob]
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
    sendCrawlerMessage,
  } = useCrawlerChatHub({
    getAccessToken,
    onUserMessageReceived: (message) => pushUiMessageFromDto(message),
    onGroupMessageReceived: (message) => pushUiMessageFromDto(message),
    onCrawlInitiated: async (data) => {
      const jid = data.crawlJobId;
      if (!jid) return;

      setActiveJobId(jid);
      setSummary(null);
      
      // Update Status Overlay
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Lifecycle: Join Groups =====
  useEffect(() => {
    if (!chatConnected || !assignmentId) return;
    let isSubscribed = true;
    (async () => {
      try { await subscribeToAssignment(assignmentId); } catch (err) { if(isSubscribed) console.error(err); }
      if (groupId) { try { await joinGroupWorkspace(groupId); } catch (err) { if(isSubscribed) console.error(err); } }
    })();
    return () => { isSubscribed = false; };
  }, [chatConnected, assignmentId, groupId, subscribeToAssignment, joinGroupWorkspace]);

  // ===== Lifecycle: Subscribe Jobs =====
  useEffect(() => {
    if (!crawlConnected || !assignmentId) return;
    let isSubscribed = true;
    (async () => {
      try { await subscribeToAssignmentJobs(assignmentId); } catch (err) { if(isSubscribed) console.error(err); }
      if (groupId) { try { await subscribeToGroupJobs(groupId); } catch (err) { if(isSubscribed) console.error(err); } }
    })();
    return () => { isSubscribed = false; };
  }, [crawlConnected, assignmentId, groupId, subscribeToAssignmentJobs, subscribeToGroupJobs]);

  // ===== Handle History Select =====
  const handleSelectConversation = useCallback(
    async (convId: string) => {
      if (!convId) return;

      // Reset Overlay State khi switch history
      setIsCrawling(false);
      setCrawlProgress(0);

      setSelectedConversationId(convId);
      setConversationId(convId);
      setSummary(null);

      try {
        const res = await fetchConversationMessages(convId, { limit: 100, offset: 0 });
        if (!res) return;

        const mappedMessages: UiMessage[] = res.map((m) => {
          const mt = m.messageType as unknown as MessageType;
          return {
            id: m.messageId,
            role: mt === MessageType.AiSummary ? "assistant" : (m.userId === userId ? "user" : "assistant"),
            content: m.content,
            createdAt: m.timestamp ?? new Date().toISOString(),
            messageType: mt,
            crawlJobId: m.crawlJobId ?? undefined,
          };
        });

        setChatMessages(mappedMessages);

        const jobMsg = res.find((m) => m.crawlJobId);
        if (!jobMsg?.crawlJobId) {
          setActiveJobId(null);
          return;
        }

        const jid = jobMsg.crawlJobId;
        setActiveJobId(jid);

        try { await fetchJobResults(jid); } catch (err) { console.error(err); }
        try { await fetchSummaryForJob(jid, { source: "manual" }); } catch (err) { console.error(err); }
      } catch (err) {
        console.error("[Crawler] handleSelectConversation error:", err);
      }
    },
    [fetchConversationMessages, fetchJobResults, fetchSummaryForJob, userId]
  );

  // ===== Action: Start Crawl =====
  const handleStartCrawl = async () => {
    const trimmedUrl = url.trim();
    const trimmedPrompt = prompt.trim();

    if (!trimmedUrl) { alert("Please enter a URL first."); return; }
    if (!trimmedPrompt) { alert("Please describe what you want to extract."); return; }
    try { new URL(trimmedUrl); } catch { alert("Invalid URL."); return; }

    if (!chatConnected) { alert("Chat connection is establishing... Please wait."); return; }
    if (!userId) { alert("UserId not found. Please reload."); return; }

    // 1. Kích hoạt Overlay & Loading
    setSubmitting(true);
    setIsCrawling(true); // BẬT MÀN HÌNH TỐI
    setCrawlStatusMsg("Initiating crawl request...");
    setCrawlProgress(0);

    const payload: ChatMessageDto = {
      conversationId,
      userId,
      userName,
      content: `${trimmedPrompt} | ${trimmedUrl}`,
      groupId: groupId || undefined,
      assignmentId: assignmentId || undefined,
      messageType: MessageType.CrawlRequest,
    };

    try {
      await sendCrawlerMessage(payload);
      setUrl("");
      setPrompt("");
      // Không tắt isCrawling ở đây, đợi Hub trả về Completed
    } catch (err: any) {
      console.error("[CrawlerWorkspace] sendCrawlerMessage error:", err);
      alert(err?.message || "Failed to send crawl request");
      setIsCrawling(false);
      setSubmitting(false);
    }
  };

  // ===== Action: Send Chat =====
  const handleSendChatMessage = async () => {
    const content = chatInput.trim();
    if (!content) return;
    if (!chatConnected) return;

    const normalizedContent = content.toLowerCase();
    const shouldMarkFollowUp = SUMMARY_KEYWORDS.some((keyword) => normalizedContent.includes(keyword));
    const messageType = shouldMarkFollowUp ? MessageType.FollowUpQuestion : MessageType.UserMessage;

    setChatInput("");
    setChatSending(true);

    const payload: ChatMessageDto = {
      conversationId,
      userId,
      userName,
      content,
      groupId: groupId || undefined,
      assignmentId: assignmentId || undefined,
      messageType,
      crawlJobId: activeJobId || undefined,
    };

    try {
      await sendCrawlerMessage(payload);
    } catch (err: any) {
      alert(err?.message || "Failed to send message");
    } finally {
      setChatSending(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-4 py-6">
        <CrawlerAssignmentHeader
          assignment={assignment}
          loading={assignmentLoading}
          chatConnected={chatConnected}
          chatConnecting={chatConnecting}
          crawlConnected={crawlConnected}
          crawlConnecting={crawlConnecting}
        />

        <section className="flex flex-col gap-4">
          <CrawlerAssignmentDescription
            assignment={assignment}
            loading={assignmentLoading}
          />

          {/* === CRAWL  FORM & OVERLAY === */}
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
            activeJobId={activeJobId}
            // Truyền Props cho Overlay
            isCrawling={isCrawling}
            progress={crawlProgress}
            statusMessage={crawlStatusMsg}
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] items-start">
            <CrawlerAssignmentConversationsSection
              conversations={conversations}
              loading={conversationsLoading || conversationMessagesLoading}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleCreateNewConversation}
            />

            <div className="flex flex-col gap-4">
              <div className="card p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--foreground)]">
                      Crawled Data &amp; Analysis
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      View structured data and AI insights from your latest job
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAnalysis((prev) => !prev)}
                    className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:bg-slate-50 transition"
                  >
                    {showAnalysis ? "Hide" : "Show"}
                  </button>
                </div>

                {showAnalysis && (
                  <div className="mt-2">
                    <CrawlerResultsSection
                      results={results}
                      resultsLoading={resultsLoading}
                      summary={summary}
                      summaryError={summaryError}
                      summaryLoading={summaryLoading}
                      activeJobId={activeJobId}
                    />
                  </div>
                )}
              </div>

              <CrawlerChatSection
                chatMessages={chatMessages}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onSendChat={handleSendChatMessage}
                chatSending={chatSending}
                chatConnected={chatConnected}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const CrawlerPage = () => (
  <Suspense>
    <CrawlerInner />
  </Suspense>
);

export default CrawlerPage;