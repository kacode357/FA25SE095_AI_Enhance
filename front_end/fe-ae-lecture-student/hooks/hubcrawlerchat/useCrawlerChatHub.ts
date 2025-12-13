"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

/** ==== Types map từ C# DTO qua FE ==== */

export enum MessageType {
 UserMessage = 0,
  CrawlRequest = 1,
  CrawlResult = 2,
  SystemNotification = 3,
  Visualization = 4,
  AiSummary = 5,
  FollowUpQuestion = 6,
}

export type ChatMessageDto = {
  messageId?: string;
  conversationId: string;
  userId: string;
  userName: string;
  content: string;
  groupId?: string | null;
  assignmentId?: string | null;
  messageType?: MessageType;
  crawlJobId?: string | null;
  timestamp?: string;
  sentAt?: string; // thêm dòng này
};

export type CrawlerResponseDto = {
  responseId?: string; // Guid
  conversationId: string; // Guid
  crawlJobId: string; // Guid
  content: string;
  status: string;
  groupId?: string | null;
  assignmentId?: string | null;
  timestamp?: string;
  metadata?: Record<string, unknown> | null;
};

// nếu BE có type cụ thể hơn thì sửa lại type này sau
export type CrawlJobStatusResponse = any;

/** Các callback options cho hook */
type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;

  // ===== Callbacks: server -> client =====

  // join/leave conversation / group / assignment
  onConversationJoined?: (conversationId: string) => void;
  onConversationLeft?: (conversationId: string) => void;

  onGroupWorkspaceJoined?: (groupId: string) => void;
  onGroupWorkspaceLeft?: (groupId: string) => void;

  onAssignmentSubscribed?: (assignmentId: string) => void;
  onAssignmentUnsubscribed?: (assignmentId: string) => void;

  // message
  onUserMessageReceived?: (message: ChatMessageDto) => void;
  onGroupMessageReceived?: (message: ChatMessageDto) => void;

  // crawl request result
  onCrawlInitiated?: (data: {
    messageId: string;
    crawlJobId: string;
    message: string;
    success: boolean;
  }) => void;
  onCrawlFailed?: (data: {
    messageId?: string;
    error: string;
    success: boolean;
  }) => void;

  // after message persisted
  onMessageSent?: (data: {
    messageId: string;
    timestamp: string;
    success: boolean;
  }) => void;

  onMessageError?: (messageId?: string, error?: string) => void;

  // crawler responses
  onCrawlerResponseReceived?: (response: CrawlerResponseDto) => void;
  onGroupCrawlerResponse?: (response: CrawlerResponseDto) => void;
  onAssignmentCrawlerResponse?: (response: CrawlerResponseDto) => void;

  // typing indicator
  onUserTyping?: (conversationId: string, userId: string, userName: string) => void;
  onUserStoppedTyping?: (conversationId: string, userId: string) => void;

  // crawl job status
  onCrawlJobStatus?: (status: CrawlJobStatusResponse) => void;
  onCrawlJobProgressUpdate?: (status: CrawlJobStatusResponse) => void;

  // error chung
  onError?: (message: string) => void;
};

export function useCrawlerChatHub({
  baseUrl =   process.env.NEXT_PUBLIC_COURSE_BASE_URL_HUB ||"",
     
  getAccessToken,
  onConversationJoined,
  onConversationLeft,
  onGroupWorkspaceJoined,
  onGroupWorkspaceLeft,
  onAssignmentSubscribed,
  onAssignmentUnsubscribed,
  onUserMessageReceived,
  onGroupMessageReceived,
  onCrawlInitiated,
  onCrawlFailed,
  onMessageSent,
  onMessageError,
  onCrawlerResponseReceived,
  onGroupCrawlerResponse,
  onAssignmentCrawlerResponse,
  onUserTyping,
  onUserStoppedTyping,
  onCrawlJobStatus,
  onCrawlJobProgressUpdate,
  onError,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);

  // ===== Build connection (lazy) =====
  const ensureConnection = useMemo(() => {
    return () => {
      if (connectionRef.current) return connectionRef.current;

      // NOTE: path hub có thể khác, nếu bên BE là /crawler-chat hoặc /crawlerChat thì chỉnh lại ở đây
      const hubUrl = `${baseUrl.replace(/\/+$/, "")}/hubs/crawler-chat`;

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              return typeof token === "string" ? token : "";
            } catch (err) {
              return "";
            }
          },
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (ctx) => {
            const delays = [500, 1000, 2000, 5000, 10000];
            return delays[Math.min(ctx.previousRetryCount, delays.length - 1)];
          },
        })
        .configureLogging(signalR.LogLevel.None)
        .build();

      // ===== Đăng ký event từ Hub (server -> client) =====

      conn.on("ConversationJoined", (conversationId: string) => {
        onConversationJoined?.(conversationId);
      });

      conn.on("ConversationLeft", (conversationId: string) => {
        onConversationLeft?.(conversationId);
      });

      conn.on("GroupWorkspaceJoined", (groupId: string) => {
        onGroupWorkspaceJoined?.(groupId);
      });

      conn.on("GroupWorkspaceLeft", (groupId: string) => {
        onGroupWorkspaceLeft?.(groupId);
      });

      conn.on("AssignmentSubscribed", (assignmentId: string) => {
        onAssignmentSubscribed?.(assignmentId);
      });

      conn.on("AssignmentUnsubscribed", (assignmentId: string) => {
        onAssignmentUnsubscribed?.(assignmentId);
      });

      conn.on("UserMessageReceived", (message: ChatMessageDto) => {
        onUserMessageReceived?.(message);
      });

      conn.on("GroupMessageReceived", (message: ChatMessageDto) => {
        onGroupMessageReceived?.(message);
      });

      conn.on(
        "CrawlInitiated",
        (data: {
          messageId: string;
          crawlJobId: string;
          message: string;
          success: boolean;
        }) => {
          onCrawlInitiated?.(data);
        }
      );

      conn.on(
        "CrawlFailed",
        (data: { messageId?: string; error: string; success: boolean }) => {
          onCrawlFailed?.(data);
        }
      );

      conn.on(
        "MessageSent",
        (data: { messageId: string; timestamp: string; success: boolean }) => {
          onMessageSent?.(data);
        }
      );

      conn.on("MessageError", (messageId?: string, error?: string) => {
        setLastError(error ?? "Unknown message error");
        onMessageError?.(messageId, error);
        onError?.(error ?? "Unknown message error");
      });

      conn.on("CrawlerResponseReceived", (response: CrawlerResponseDto) => {
        onCrawlerResponseReceived?.(response);
      });

      conn.on("GroupCrawlerResponse", (response: CrawlerResponseDto) => {
        onGroupCrawlerResponse?.(response);
      });

      conn.on("AssignmentCrawlerResponse", (response: CrawlerResponseDto) => {
        onAssignmentCrawlerResponse?.(response);
      });

      conn.on(
        "UserTyping",
        (conversationId: string, userId: string, userName: string) => {
          onUserTyping?.(conversationId, userId, userName);
        }
      );

      conn.on("UserStoppedTyping", (conversationId: string, userId: string) => {
        onUserStoppedTyping?.(conversationId, userId);
      });

      conn.on("CrawlJobStatus", (status: CrawlJobStatusResponse) => {
        onCrawlJobStatus?.(status);
      });

      conn.on("CrawlJobProgressUpdate", (status: CrawlJobStatusResponse) => {
        onCrawlJobProgressUpdate?.(status);
      });

      conn.onclose(() => {
        setConnected(false);
        setConnectionId(null);
      });

      conn.onreconnecting(() => {
        setConnected(false);
      });

      conn.onreconnected((newConnectionId) => {
        setConnected(true);
        setConnectionId(newConnectionId ?? conn.connectionId ?? null);
      });

      connectionRef.current = conn;
      return conn;
    };
  }, [
    baseUrl,
    getAccessToken,
    onConversationJoined,
    onConversationLeft,
    onGroupWorkspaceJoined,
    onGroupWorkspaceLeft,
    onAssignmentSubscribed,
    onAssignmentUnsubscribed,
    onUserMessageReceived,
    onGroupMessageReceived,
    onCrawlInitiated,
    onCrawlFailed,
    onMessageSent,
    onMessageError,
    onCrawlerResponseReceived,
    onGroupCrawlerResponse,
    onAssignmentCrawlerResponse,
    onUserTyping,
    onUserStoppedTyping,
    onCrawlJobStatus,
    onCrawlJobProgressUpdate,
    onError,
  ]);

  // ===== Public APIs =====

  const connect = useCallback(async () => {
    const conn = ensureConnection();

    if (conn.state === signalR.HubConnectionState.Connected) {
      setConnected(true);
      setConnectionId(conn.connectionId ?? null);
      setLastError(null);
      return;
    }

    if (startInProgressRef.current) {
      return;
    }

    try {
      startInProgressRef.current = true;
      setConnecting(true);

      await conn.start();

      setConnected(true);
      setConnectionId(conn.connectionId ?? null);
      setLastError(null);
    } catch (e: any) {
      const rawMsg: string = e?.message ?? "";
      const isStrictModeStop =
        rawMsg.includes("Failed to start the HttpConnection before stop() was called");

      if (!isStrictModeStop) {
        const friendlyMsg = rawMsg || "Failed to connect CrawlerChatHub";
        setConnected(false);
        setConnectionId(null);
        setLastError(friendlyMsg);
        onError?.(friendlyMsg);
      }
    } finally {
      setConnecting(false);
      startInProgressRef.current = false;
    }
  }, [ensureConnection, onError]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state === signalR.HubConnectionState.Disconnected) {
      setConnected(false);
      setConnectionId(null);
      return;
    }

    try {
      await conn.stop();
    } finally {
      setConnected(false);
      setConnectionId(null);
    }
  }, []);

  // ===== wrapper call hub methods (client -> server) =====

  const joinConversation = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("JoinConversation", conversationId);
  }, []);

  const leaveConversation = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("LeaveConversation", conversationId);
  }, []);

  const joinGroupWorkspace = useCallback(async (groupId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("JoinGroupWorkspace", groupId);
  }, []);

  const leaveGroupWorkspace = useCallback(async (groupId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("LeaveGroupWorkspace", groupId);
  }, []);

  const subscribeToAssignment = useCallback(async (assignmentId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("SubscribeToAssignment", assignmentId);
  }, []);

  const unsubscribeFromAssignment = useCallback(async (assignmentId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("UnsubscribeFromAssignment", assignmentId);
  }, []);

  const sendCrawlerMessage = useCallback(async (message: ChatMessageDto) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error("CrawlerChatHub not connected");
    }

    // đảm bảo default MessageType
    const payload: ChatMessageDto = {
      messageType: MessageType.UserMessage,
      ...message,
    };

    await conn.invoke("SendCrawlerMessage", payload);
  }, []);

  const userTyping = useCallback(
    async (conversationId: string, userId: string, userName: string) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
      await conn.invoke("UserTyping", conversationId, userId, userName);
    },
    []
  );

  const userStoppedTyping = useCallback(
    async (conversationId: string, userId: string) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
      await conn.invoke("UserStoppedTyping", conversationId, userId);
    },
    []
  );

  const subscribeToCrawlJob = useCallback(
    async (jobId: string, conversationId: string) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
      await conn.invoke("SubscribeToCrawlJob", jobId, conversationId);
    },
    []
  );

  const unsubscribeFromCrawlJob = useCallback(async (jobId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("UnsubscribeFromCrawlJob", jobId);
  }, []);

  // BroadcastJobProgress là server gọi, FE thường không cần invoke, nên bỏ qua

  return {
    // state
    connected,
    connecting,
    lastError,
    connectionId,

    // connection control
    connect,
    disconnect,

    // chat actions
    joinConversation,
    leaveConversation,
    joinGroupWorkspace,
    leaveGroupWorkspace,
    subscribeToAssignment,
    unsubscribeFromAssignment,
    sendCrawlerMessage,
    userTyping,
    userStoppedTyping,
    subscribeToCrawlJob,
    unsubscribeFromCrawlJob,
  };
}
