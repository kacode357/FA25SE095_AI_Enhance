"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Send, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/contexts/AuthContext";
import { getSavedAccessToken } from "@/utils/auth/access-token";

import {
  useCrawlerChatHub,
  MessageType,
  type ChatMessageDto,
  type CrawlerResponseDto,
} from "@/hooks/hubcrawlerchat/useCrawlerChatHub";

import { useCrawlerAssignmentConversations } from "@/hooks/crawler-chat/useCrawlerAssignmentConversations";
import { useCrawlerConversationMessages } from "@/hooks/crawler-chat/useCrawlerConversationMessages";

import {
  CrawlerChatMessageType,
  type CrawlerChatMessageItem,
} from "@/types/crawler-chat/crawler-chat.response";

import CrawlerMessagesList, {
  type LocalMessage,
} from "./CrawlerMessagesList";
import CrawlerContextCard from "./CrawlerContextCard";
import CrawlerHeaderBar from "./CrawlerHeaderBar";
import { useCrawlHub } from "@/hooks/hubcrawlerchat/useCrawlHub";

type CrawlerStatus = "idle" | "running" | "success" | "error";

export default function CrawlerWorkspacePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const courseId = searchParams.get("courseId") || "";
  const assignmentId = searchParams.get("assignmentId") || "";
  const groupId = searchParams.get("groupId") || "";

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [firstMessageSent, setFirstMessageSent] = useState(false);

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Smart crawl inputs
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlPrompt, setCrawlPrompt] = useState("");
  const [crawlSending, setCrawlSending] = useState(false);

  // Crawl status (high level)
  const [crawlerStatus, setCrawlerStatus] = useState<CrawlerStatus>("idle");
  const [crawlerStatusText, setCrawlerStatusText] = useState<string | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const userId = user?.id ?? "";
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "You";

  // ==== hub: chat (classroom) ====
  const {
    connected: chatHubConnected,
    connecting: chatHubConnecting,
    lastError,
    connectionId,
    connect: connectChatHub,
    joinConversation,
    sendCrawlerMessage,
    subscribeToCrawlJob,
  } = useCrawlerChatHub({
    getAccessToken: () => getSavedAccessToken() || "",
    onCrawlerResponseReceived: (resp: CrawlerResponseDto) => {
      // ghi log raw resp để debug status
      console.log("[CrawlerWorkspace] CrawlerResponseReceived(raw):", resp);

      setMessages((prev) => [...prev, { kind: "crawler", msg: resp }]);

      if (resp?.status) {
        setCrawlerStatusText(resp.status);

        const lower = resp.status.toLowerCase();
        if (lower.includes("complete") || lower.includes("success")) {
          setCrawlerStatus("success");
        } else if (lower.includes("fail") || lower.includes("error")) {
          setCrawlerStatus("error");
        }
      }
    },
    onCrawlInitiated: (data) => {
      console.log("[CrawlerWorkspace] onCrawlInitiated:", data);
      if (!data.success) return;
      const convId = conversationIdRef.current;
      if (!convId) return;

      // trạng thái bắt đầu crawl
      setCrawlerStatus("running");
      setCrawlerStatusText("Crawl started");

      // subscribe group trong CrawlerChatHub (classroom)
      subscribeToCrawlJob(data.crawlJobId, convId).catch((err) => {
        console.warn("[CrawlerWorkspace] subscribeToCrawlJob error:", err);
      });

      // đồng thời subscribe job bên CrawlHub (webcrawler)
      subscribeToJob(data.crawlJobId).catch((err) => {
        console.warn("[CrawlerWorkspace] subscribeToJob(CrawlHub) error:", err);
      });
    },
    onMessageError: (_messageId, error) => {
      setPageError(error || "Failed to send message");
    },
    onError: (msg) => {
      setPageError(msg);
    },
  });

  // ==== hub: crawl (WebCrawlerService) ====
  const {
    connected: crawlHubConnected,
    connect: connectCrawlHub,
    subscribeToJob,
  } = useCrawlHub({
    getAccessToken: () => getSavedAccessToken() || "",
    onConnectedChange: (c) => {
      console.log("[CrawlerWorkspace] CrawlHub connected:", c);
    },
    onJobStarted: (payload) => {
      console.log("[CrawlerWorkspace] JobStarted:", payload);
      setCrawlerStatus("running");
      setCrawlerStatusText("Job started");
    },
    onJobProgress: (payload) => {
      console.log("[CrawlerWorkspace] JobProgress:", payload);
      setCrawlerStatus("running");

      const pct =
        payload?.progressPercentage ??
        payload?.progress ??
        payload?.ProgressPercentage ??
        null;

      if (typeof pct === "number") {
        setCrawlerStatusText(`Running (${Math.round(pct)}%)`);
      } else {
        setCrawlerStatusText("Running");
      }
    },
    onJobCompleted: (payload) => {
      console.log("[CrawlerWorkspace] JobCompleted:", payload);
      setCrawlerStatus("success");
      setCrawlerStatusText("Completed");
    },
    onJobExtraction: (payload) => {
      console.log("[CrawlerWorkspace] JobExtraction event:", payload);
    },
    onJobPagination: (payload) => {
      console.log("[CrawlerWorkspace] JobPagination event:", payload);
    },
    onJobNavigation: (payload) => {
      console.log("[CrawlerWorkspace] JobNavigation event:", payload);
    },
    onError: (msg) => {
      console.error("[CrawlerWorkspace] CrawlHub error:", msg);
      setCrawlerStatus("error");
      setCrawlerStatusText(msg);
    },
  });

  // ==== conversations theo assignment ====
  const {
    fetchAssignmentConversations,
    conversations,
    loading: loadingConversations,
  } = useCrawlerAssignmentConversations();

  // ==== messages theo conversation ====
  const {
    fetchConversationMessages,
    loading: loadingHistory,
  } = useCrawlerConversationMessages();

  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  // Fetch conversations khi có assignmentId
  useEffect(() => {
    if (!assignmentId || conversationsLoaded) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetchAssignmentConversations(assignmentId, {
          myOnly: true,
        });

        if (cancelled) return;
        setConversationsLoaded(true);

        if (res && res.length > 0) {
          const firstConvId = res[0].conversationId;
          setConversationId(firstConvId);
          conversationIdRef.current = firstConvId;

          if (!chatHubConnected && !chatHubConnecting) {
            await connectChatHub();
          }
          // Kết nối CrawlHub sẵn luôn
          await connectCrawlHub();
        } else {
          if (!chatHubConnected && !chatHubConnecting) {
            await connectChatHub();
          }
          await connectCrawlHub();
        }
      } catch {
        if (!cancelled) {
          setConversationsLoaded(true);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    assignmentId,
    fetchAssignmentConversations,
    chatHubConnected,
    chatHubConnecting,
    connectChatHub,
    connectCrawlHub,
    conversationsLoaded,
  ]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // load history
  useEffect(() => {
    if (!conversationId || historyLoaded) return;

    let cancelled = false;

    const mapHistoryToLocal = (
      items: CrawlerChatMessageItem[]
    ): LocalMessage[] => {
      return items.map((m) => {
        if (m.messageType === CrawlerChatMessageType.UserMessage) {
          const dto: ChatMessageDto = {
            messageId: m.messageId,
            conversationId: m.conversationId,
            userId: m.userId,
            userName: m.userName,
            content: m.content,
            groupId: m.groupId,
            assignmentId: m.assignmentId,
            messageType: MessageType.UserMessage,
            crawlJobId: m.crawlJobId,
            timestamp: m.timestamp,
          };
          return { kind: "user", msg: dto };
        }

        const resp: CrawlerResponseDto = {
          responseId: m.messageId,
          conversationId: m.conversationId,
          crawlJobId: (m.crawlJobId ?? "") as string,
          content: m.content,
          status: "History",
          groupId: m.groupId,
          assignmentId: m.assignmentId,
          timestamp: m.timestamp,
          metadata: null,
        };

        return { kind: "crawler", msg: resp };
      });
    };

    const run = async () => {
      try {
        const res = await fetchConversationMessages(conversationId, {
          limit: 100,
          offset: 0,
        });

        if (cancelled || !res) return;

        setHistoryLoaded(true);

        setMessages((prev) => {
          if (prev.length > 0) return prev;
          return mapHistoryToLocal(res);
        });
      } catch {
        if (!cancelled) {
          setHistoryLoaded(true);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [conversationId, historyLoaded, fetchConversationMessages]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const canSend = useMemo(() => {
    return !!assignmentId && !!userId && input.trim().length > 0 && !sending;
  }, [assignmentId, userId, input, sending]);

  const canSmartCrawl = useMemo(() => {
    return (
      !!assignmentId &&
      !!userId &&
      crawlUrl.trim().length > 0 &&
      crawlPrompt.trim().length > 0 &&
      !crawlSending
    );
  }, [assignmentId, userId, crawlUrl, crawlPrompt, crawlSending]);

  const ensureConnectedAndJoined = useCallback(
    async (existingConversationId?: string | null): Promise<string> => {
      if (!chatHubConnected && !chatHubConnecting) {
        await connectChatHub();
      }
      if (!crawlHubConnected) {
        await connectCrawlHub();
      }

      let convId = existingConversationId ?? conversationIdRef.current;

      if (!convId) {
        const apiConvId =
          conversations.length > 0 ? conversations[0].conversationId : null;

        if (apiConvId) {
          convId = apiConvId;
        } else if (typeof crypto !== "undefined" && crypto.randomUUID) {
          convId = crypto.randomUUID();
        } else {
          convId = `conv-${Date.now()}`;
        }

        setConversationId(convId);
        conversationIdRef.current = convId;
      }

      await joinConversation(convId);

      return convId;
    },
    [
      connectChatHub,
      connectCrawlHub,
      chatHubConnected,
      chatHubConnecting,
      crawlHubConnected,
      conversations,
      joinConversation,
    ]
  );

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setPageError(null);

      const trimmed = input.trim();
      if (!trimmed || sending) return;

      if (!assignmentId) {
        setPageError("Missing assignmentId in URL");
        return;
      }
      if (!userId) {
        setPageError("Missing userId");
        return;
      }

      setSending(true);

      const localMessageId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `local-${Date.now()}`;

      const optimisticConvId =
        conversationIdRef.current || "pending-conversation";

      const userMsg: ChatMessageDto = {
        messageId: localMessageId,
        conversationId: optimisticConvId,
        userId,
        userName,
        content: trimmed,
        groupId: groupId || null,
        assignmentId: assignmentId || null,
        messageType: MessageType.UserMessage,
        crawlJobId: null,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, { kind: "user", msg: userMsg }]);
      setInput("");

      try {
        const realConvId = await ensureConnectedAndJoined(
          conversationIdRef.current
        );

        await sendCrawlerMessage({
          conversationId: realConvId,
          userId,
          userName,
          content: trimmed,
          groupId: groupId || null,
          assignmentId: assignmentId || null,
          messageType: MessageType.UserMessage,
        });

        setFirstMessageSent(true);
      } catch (err: any) {
        const msg = err?.message ?? "Failed to send message";
        setPageError(msg);
      } finally {
        setSending(false);
      }
    },
    [
      assignmentId,
      ensureConnectedAndJoined,
      groupId,
      input,
      sending,
      sendCrawlerMessage,
      userId,
      userName,
    ]
  );

  const handleSmartCrawl = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setPageError(null);

      const url = crawlUrl.trim();
      const prompt = crawlPrompt.trim();

      if (!url || !prompt || crawlSending) return;

      if (!assignmentId) {
        setPageError("Missing assignmentId in URL");
        return;
      }
      if (!userId) {
        setPageError("Missing userId");
        return;
      }

      try {
        // eslint-disable-next-line no-new
        new URL(url);
      } catch {
        setPageError(
          "URL không hợp lệ, vui lòng nhập dạng https://example.com"
        );
        return;
      }

      setCrawlSending(true);

      const localMessageId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `local-crawl-${Date.now()}`;

      const optimisticConvId =
        conversationIdRef.current || "pending-conversation";

      const content = `${prompt} | ${url}`;

      const crawlMsg: ChatMessageDto = {
        messageId: localMessageId,
        conversationId: optimisticConvId,
        userId,
        userName,
        content,
        groupId: groupId || null,
        assignmentId: assignmentId || null,
        messageType: MessageType.CrawlRequest,
        crawlJobId: null,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, { kind: "user", msg: crawlMsg }]);

      try {
        const realConvId = await ensureConnectedAndJoined(
          conversationIdRef.current
        );

        await sendCrawlerMessage({
          conversationId: realConvId,
          userId,
          userName,
          content,
          groupId: groupId || null,
          assignmentId: assignmentId || null,
          messageType: MessageType.CrawlRequest,
        });

        setFirstMessageSent(true);
        setCrawlUrl("");
        setCrawlPrompt("");

        setCrawlerStatus("running");
        setCrawlerStatusText("Crawl requested");
      } catch (err: any) {
        const msg = err?.message ?? "Failed to start crawl";
        setPageError(msg);
      } finally {
        setCrawlSending(false);
      }
    },
    [
      assignmentId,
      crawlUrl,
      crawlPrompt,
      crawlSending,
      ensureConnectedAndJoined,
      groupId,
      sendCrawlerMessage,
      userId,
      userName,
    ]
  );

  const textareaPlaceholder = assignmentId
    ? "Nhập câu hỏi để hệ thống crawl & phân tích..."
    : "Thiếu assignmentId trong URL";

  return (
    <div className="min-h-[60vh] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
      {/* Header */}
      <CrawlerHeaderBar
        chatHubConnected={chatHubConnected}
        chatConnectionId={connectionId}
        crawlHubConnected={crawlHubConnected}
        crawlerStatusText={crawlerStatusText}
        onReconnectChatHub={() => connectChatHub()}
        reconnectingChatHub={chatHubConnecting}
      />

      {/* Context */}
      <CrawlerContextCard
        courseId={courseId}
        assignmentId={assignmentId}
        groupId={groupId}
        loadingConversations={loadingConversations}
        conversationsCount={conversations.length}
      />

      {/* Error */}
      {(pageError || lastError) && (
        <div className="flex items-start gap-2 text-xs sm:text-sm border border-red-200 bg-red-50 text-red-700 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4 mt-[1px]" />
          <div>
            <div className="font-semibold">Có lỗi xảy ra</div>
            <div>{pageError || lastError}</div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 min-h-[260px] border rounded-lg bg-white shadow-sm flex flex-col">
        <div className="border-b px-3 py-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {conversationId
              ? `Conversation: ${conversationId.slice(0, 8)}...`
              : "Chưa có conversation (sẽ tạo/gán ở message đầu tiên)"}
          </span>
          {firstMessageSent && !chatHubConnected && (
            <span className="text-red-500">Đang thử kết nối hub...</span>
          )}
        </div>

        <CrawlerMessagesList
          messages={messages}
          loadingHistory={loadingHistory}
          messagesEndRef={messagesEndRef}
        />

        {/* input */}
        <form
          onSubmit={handleSend}
          className="border-t px-3 py-2 flex flex-col gap-3"
        >
          {/* Smart Crawl form */}
          <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Smart crawl
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">
                  URL to crawl
                </span>
                <Input
                  type="url"
                  placeholder="https://example.com/page"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  disabled={crawlSending || sending || !assignmentId}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">
                  What to extract (prompt)
                </span>
                <Input
                  type="text"
                  placeholder="Extract product names, prices, descriptions..."
                  value={crawlPrompt}
                  onChange={(e) => setCrawlPrompt(e.target.value)}
                  disabled={crawlSending || sending || !assignmentId}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <p className="text-[11px] text-slate-500">
                Hệ thống sẽ gửi lên hub dạng: <code>prompt | url</code> với{" "}
                <code>messageType = CrawlRequest</code>.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={handleSmartCrawl}
                disabled={!canSmartCrawl}
                className="flex items-center gap-1"
              >
                {crawlSending && <Loader2 className="h-3 w-3 animate-spin" />}
                {!crawlSending && <Send className="h-3 w-3" />}
                <span>Smart crawl</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={textareaPlaceholder}
              className="min-h-[60px] text-sm"
              disabled={sending || !assignmentId}
            />
            <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0 sm:flex-col sm:justify-between">
              <Button
                type="submit"
                size="sm"
                disabled={!canSend}
                className="flex items-center gap-1"
              >
                {sending && <Loader2 className="h-3 w-3 animate-spin" />}
                {!sending && <Send className="h-3 w-3" />}
                <span>Send</span>
              </Button>

              {!chatHubConnected && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => connectChatHub()}
                  disabled={chatHubConnecting}
                >
                  {chatHubConnecting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
