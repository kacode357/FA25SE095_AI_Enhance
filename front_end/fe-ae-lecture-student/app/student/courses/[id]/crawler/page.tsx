// app/.../crawler/page.tsx
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

import type { CrawlSummary, UiMessage } from "./crawler-types";
import CrawlerUrlPromptSection from "./components/CrawlerUrlPromptSection";
import CrawlerResultsSection from "./components/CrawlerResultsSection";
import CrawlerChatSection from "./components/CrawlerChatSection";
import CrawlerAssignmentHeader from "./components/CrawlerAssignmentHeader";
import CrawlerAssignmentDescription from "./components/CrawlerAssignmentDescription";

/** Base URL cho dịch vụ crawler (REST) */
const CRAWLER_BASE_URL =
  process.env.NEXT_PUBLIC_CRAWLER_BASE_URL ||
  "https://crawl.fishmakeweb.id.vn";

/** Keywords dùng để detect follow-up question */
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

const CrawlerInner = () => {
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const assignmentId = searchParams.get("assignmentId");
  const groupId = searchParams.get("groupId");

  // ===== user info =====
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

  // conversation id cố định cho trang
  const [conversationId] = useState<string>(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  // ===== ASSIGNMENT INFO =====
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

  // ===== state crawl form =====
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // ===== summary state =====
  const [summary, setSummary] = useState<CrawlSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // ===== Agent chat state (SignalR) =====
  const [chatMessages, setChatMessages] = useState<UiMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  // ===== hooks kết quả crawl =====
  const {
    fetchJobResults,
    loading: resultsLoading,
    results,
  } = useSmartCrawlerJobResults();

  const promptUsed = useMemo(() => {
    if (!results?.length) return "";
    return results[0]?.promptUsed || "";
  }, [results]);

  // ===== CrawlHub =====
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
    onJobStarted: () => {},
    onJobProgress: () => {},
    onJobCompleted: async (payload: any) => {
      const jid: string =
        payload?.jobId || payload?.JobId || payload?.jobID || "";
      if (!jid) return;

      setActiveJobId(jid);
      setSummary(null);

      try {
        await fetchJobResults(jid);
      } catch (err) {
        console.error("[CrawlerWorkspace] fetchJobResults error:", err);
      }
    },
    onError: (msg) => console.error("[CrawlHub] error:", msg),
  });

  // ===== helper: gọi /summary =====
  const fetchSummaryForJob = useCallback(
    async (jobId: string, _opts?: { source?: "manual" | "keyword" }) => {
      const normalizedJobId = jobId.trim();
      if (!normalizedJobId) return;

      const token = getAccessToken();
      if (!token) {
        setSummaryError("Không tìm thấy access token.");
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
            (raw.fieldCoverage ||
              raw.FieldCoverage ||
              []) as CrawlSummary["fieldCoverage"],
          chartPreviews:
            (raw.chartPreviews ||
              raw.ChartPreviews ||
              []) as CrawlSummary["chartPreviews"],
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

  // ===== CrawlerChatHub =====
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
    onUserMessageReceived: (message) => {
      pushUiMessageFromDto(message);
    },
    onGroupMessageReceived: (message) => {
      pushUiMessageFromDto(message);
    },
    onCrawlInitiated: async (data) => {
      const jid = data.crawlJobId;
      if (!jid) return;

      setActiveJobId(jid);
      setSummary(null);

      try {
        await subscribeToJob(jid); // chỉ truyền jobId
      } catch (err) {
        console.error("[CrawlHub] subscribeToJob error:", err);
      }
    },
    onError: (msg) => console.error("[CrawlerChatHub] error:", msg),
  });

  // ===== log context =====
  useEffect(() => {
    console.log(
      `Crawler context: courseId=${courseId || "null"}, assignmentId=${
        assignmentId || "null"
      }, groupId=${groupId || "null"}, conversationId=${conversationId}`
    );
  }, [courseId, assignmentId, groupId, conversationId]);

  // connect / disconnect hubs
  useEffect(() => {
    connectChat();
    connectCrawl();

    return () => {
      disconnectChat();
      disconnectCrawl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // chat hub join assignment / group
  useEffect(() => {
    if (!chatConnected || !assignmentId) return;

    (async () => {
      try {
        await subscribeToAssignment(assignmentId);
      } catch (err) {
        console.error("[CrawlerChatHub] subscribeToAssignment error:", err);
      }

      if (groupId) {
        try {
          await joinGroupWorkspace(groupId);
        } catch (err) {
          console.error("[CrawlerChatHub] joinGroupWorkspace error:", err);
        }
      }
    })();
  }, [
    chatConnected,
    assignmentId,
    groupId,
    subscribeToAssignment,
    joinGroupWorkspace,
  ]);

  // crawl hub subscribe jobs
  useEffect(() => {
    if (!crawlConnected || !assignmentId) return;

    (async () => {
      try {
        await subscribeToAssignmentJobs(assignmentId);
      } catch (err) {
        console.error("[CrawlHub] subscribeToAssignmentJobs error:", err);
      }

      if (groupId) {
        try {
          await subscribeToGroupJobs(groupId);
        } catch (err) {
          console.error("[CrawlHub] subscribeToGroupJobs error:", err);
        }
      }
    })();
  }, [
    crawlConnected,
    assignmentId,
    groupId,
    subscribeToAssignmentJobs,
    subscribeToGroupJobs,
  ]);

  useEffect(() => {
    if (chatError) console.error("[CrawlerChatHub] lastError:", chatError);
  }, [chatError]);

  useEffect(() => {
    if (crawlError) console.error("[CrawlHub] lastError:", crawlError);
  }, [crawlError]);

  // ===== handlers =====
  const handleStartCrawl = async () => {
    const trimmedUrl = url.trim();
    const trimmedPrompt = prompt.trim();

    if (!trimmedUrl) {
      alert("Nhập URL trước đã.");
      return;
    }
    if (!trimmedPrompt) {
      alert("Nhập prompt mô tả cần extract.");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      alert("URL không hợp lệ. Ví dụ: https://example.com");
      return;
    }

    if (!chatConnected) {
      alert("CrawlerChatHub chưa connected.");
      return;
    }
    if (!userId) {
      alert("Không tìm thấy userId, kiểm tra AuthContext.");
      return;
    }

    setSubmitting(true);

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
    } catch (err: any) {
      console.error("[CrawlerWorkspace] sendCrawlerMessage error:", err);
      alert(err?.message || "Gửi crawl request thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChatMessage = async () => {
    const content = chatInput.trim();
    if (!content) return;
    if (!chatConnected) {
      alert("CrawlerChatHub chưa connected.");
      return;
    }
    if (!userId) {
      alert("Không tìm thấy userId.");
      return;
    }

    const normalizedContent = content.toLowerCase();
    const shouldMarkFollowUp = SUMMARY_KEYWORDS.some((keyword) =>
      normalizedContent.includes(keyword)
    );

    const messageType = shouldMarkFollowUp
      ? MessageType.FollowUpQuestion
      : MessageType.UserMessage;

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
      console.error("[CrawlerWorkspace] send chat error:", err);
      alert(err?.message || "Gửi tin nhắn thất bại");
    } finally {
      setChatSending(false);
    }
  };

  // ===== UI =====
 return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        {/* Header: assignment info + hub status */}
        <CrawlerAssignmentHeader
          assignment={assignment}
          loading={assignmentLoading}
          chatConnected={chatConnected}
          chatConnecting={chatConnecting}
          crawlConnected={crawlConnected}
          crawlConnecting={crawlConnecting}
        />

        {/* TẤT CẢ dưới assignment details, theo thứ tự:
            1. Assignment details
            2. URL & Prompt
            3. Chat with Agent
            4. Crawl Results
        */}
        <section className="flex flex-col gap-4">
          <CrawlerAssignmentDescription
            assignment={assignment}
            loading={assignmentLoading}
          />

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
          />

          <CrawlerChatSection
            chatMessages={chatMessages}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={handleSendChatMessage}
            chatSending={chatSending}
            chatConnected={chatConnected}
          />

          <CrawlerResultsSection
            results={results}
            resultsLoading={resultsLoading}
            summary={summary}
            summaryError={summaryError}
            summaryLoading={summaryLoading}
            activeJobId={activeJobId}
          />
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
