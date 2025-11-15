// hooks/hubcrawlerchat/useCrawlerChatHub.ts
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

/** ================ Enum khớp với C# MessageType ================ */
// (UserMessage = 0, CrawlRequest = 1, ...)
export enum CrawlerMessageType {
  UserMessage = 0,
  CrawlRequest = 1,
  CrawlResult = 2,
  SystemNotification = 3,
  Visualization = 4,
  AiSummary = 5,
  FollowUpQuestion = 6,
}

/** ================ DTO khớp C# ChatMessageDto ================ */
export type ChatMessageDto = {
  /** MUST là GUID string parse được */
  messageId: string;
  conversationId: string;
  userId: string;
  userName: string;
  content: string;
  groupId?: string | null;
  assignmentId?: string | null;
  /** số: 0,1,2... */
  messageType: CrawlerMessageType | number;
  crawlJobId?: string | null;
  /** ISO string, C# bind sang DateTime */
  timestamp: string;
};

export type CrawlerResponseDto = {
  responseId: string;
  conversationId: string;
  crawlJobId: string;
  content: string;
  status: string;
  groupId?: string | null;
  assignmentId?: string | null;
  timestamp?: string;
  metadata?: Record<string, any> | null;
};

export type CrawlJobStatusResponse = any;

type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;
  hubPath?: string;

  onUserMessageReceived?: (msg: ChatMessageDto) => void;
  onGroupMessageReceived?: (msg: ChatMessageDto) => void;
  onCrawlerResponseReceived?: (res: CrawlerResponseDto) => void;
  onGroupCrawlerResponse?: (res: CrawlerResponseDto) => void;
  onAssignmentCrawlerResponse?: (res: CrawlerResponseDto) => void;

  onCrawlInitiated?: (payload: {
    messageId: string;
    crawlJobId: string;
    message: string;
    success: boolean;
    status?: string;
  }) => void;

  onCrawlFailed?: (payload: {
    messageId?: string;
    error: string;
    success: boolean;
    jobId?: string;
  }) => void;

  onMessageSent?: (payload: {
    messageId: string;
    timestamp: string;
    success: boolean;
  }) => void;

  onMessageError?: (messageId: string, error: string) => void;

  onUserTyping?: (
    conversationId: string,
    userId: string,
    userName: string
  ) => void;
  onUserStoppedTyping?: (conversationId: string, userId: string) => void;

  onCrawlJobStatus?: (status: CrawlJobStatusResponse) => void;
  onCrawlJobProgressUpdate?: (status: CrawlJobStatusResponse) => void;

  /** 👉 event khi BE bắn CrawlResultReady */
  onCrawlResultReady?: (payload: any) => void;

  onError?: (message: string) => void;

  /** debounce connect để tránh spam (ms) */
  debounceMs?: number;
};

/** Helper tạo GUID giống file test HTML */
export const generateGuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export function useCrawlerChatHub({
  baseUrl = process.env.NEXT_PUBLIC_COURSE_BASE_URL_HUB || "",
  hubPath = "/hubs/crawler-chat",
  getAccessToken,
  onUserMessageReceived,
  onGroupMessageReceived,
  onCrawlerResponseReceived,
  onGroupCrawlerResponse,
  onAssignmentCrawlerResponse,
  onCrawlInitiated,
  onCrawlFailed,
  onMessageSent,
  onMessageError,
  onUserTyping,
  onUserStoppedTyping,
  onCrawlJobStatus,
  onCrawlJobProgressUpdate,
  onError,
  debounceMs = 200,
  onCrawlResultReady,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);

  // debounce connect
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectPromiseRef = useRef<Promise<void> | null>(null);

  /** ===== Build connection (lazy) ===== */
  const ensureConnection = useMemo(() => {
    return () => {
      if (connectionRef.current) return connectionRef.current;

      const hubUrl = `${baseUrl.replace(/\/+$/, "")}${hubPath}`;
      console.log("[CrawlerChatHub] build connection:", hubUrl);

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              const tokenStr = typeof token === "string" ? token : "";
              console.log(
                "[CrawlerChatHub] accessTokenFactory got token:",
                tokenStr ? tokenStr.slice(0, 25) + "..." : "(EMPTY)"
              );
              return tokenStr;
            } catch (err) {
              console.error("[CrawlerChatHub] accessTokenFactory error:", err);
              return "";
            }
          },
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (ctx) => {
            const delays = [500, 1000, 2000, 5000, 10000];
            return delays[Math.min(ctx.previousRetryCount, delays.length - 1)];
          },
        })
        // 👇 TẮT log nội bộ SignalR để không spam console / Next overlay
        .configureLogging(signalR.LogLevel.None)
        .build();

      // ===== Hub events =====
      conn.on("ConversationJoined", (conversationId: string) => {
        console.log("[CrawlerChatHub] ConversationJoined:", conversationId);
      });

      conn.on("ConversationLeft", (conversationId: string) => {
        console.log("[CrawlerChatHub] ConversationLeft:", conversationId);
      });

      conn.on("GroupWorkspaceJoined", (groupId: string) => {
        console.log("[CrawlerChatHub] GroupWorkspaceJoined:", groupId);
      });

      conn.on("GroupWorkspaceLeft", (groupId: string) => {
        console.log("[CrawlerChatHub] GroupWorkspaceLeft:", groupId);
      });

      conn.on("AssignmentSubscribed", (assignmentId: string) => {
        console.log("[CrawlerChatHub] AssignmentSubscribed:", assignmentId);
      });

      conn.on("AssignmentUnsubscribed", (assignmentId: string) => {
        console.log("[CrawlerChatHub] AssignmentUnsubscribed:", assignmentId);
      });

      conn.on("UserMessageReceived", (msg: ChatMessageDto) => {
        console.log("[CrawlerChatHub] UserMessageReceived:", msg);
        onUserMessageReceived?.(msg);
      });

      conn.on("GroupMessageReceived", (msg: ChatMessageDto) => {
        console.log("[CrawlerChatHub] GroupMessageReceived:", msg);
        onGroupMessageReceived?.(msg);
      });

      conn.on("CrawlerResponseReceived", (res: CrawlerResponseDto) => {
        console.log("[CrawlerChatHub] CrawlerResponseReceived:", res);
        onCrawlerResponseReceived?.(res);
      });

      conn.on("GroupCrawlerResponse", (res: CrawlerResponseDto) => {
        console.log("[CrawlerChatHub] GroupCrawlerResponse:", res);
        onGroupCrawlerResponse?.(res);
      });

      conn.on("AssignmentCrawlerResponse", (res: CrawlerResponseDto) => {
        console.log("[CrawlerChatHub] AssignmentCrawlerResponse:", res);
        onAssignmentCrawlerResponse?.(res);
      });

      conn.on(
        "CrawlInitiated",
        (payload: {
          messageId: string;
          crawlJobId: string;
          message: string;
          success: boolean;
          status?: string;
        }) => {
          console.log("[CrawlerChatHub] CrawlInitiated:", payload);
          onCrawlInitiated?.(payload);
        }
      );

      conn.on(
        "CrawlFailed",
        (payload: {
          messageId?: string;
          error: string;
          success: boolean;
          jobId?: string;
        }) => {
          console.warn("[CrawlerChatHub] CrawlFailed:", payload);
          onCrawlFailed?.(payload);
        }
      );

      conn.on(
        "MessageSent",
        (payload: {
          messageId: string;
          timestamp: string;
          success: boolean;
        }) => {
          console.log("[CrawlerChatHub] MessageSent:", payload);
          onMessageSent?.(payload);
        }
      );

      conn.on("MessageError", (messageId: string, error: string) => {
        console.error("[CrawlerChatHub] MessageError:", messageId, error);
        onMessageError?.(messageId, error);
      });

      conn.on(
        "UserTyping",
        (conversationId: string, userId: string, userName: string) => {
          console.log(
            "[CrawlerChatHub] UserTyping:",
            conversationId,
            userId,
            userName
          );
          onUserTyping?.(conversationId, userId, userName);
        }
      );

      conn.on("UserStoppedTyping", (conversationId: string, userId: string) => {
        console.log(
          "[CrawlerChatHub] UserStoppedTyping:",
          conversationId,
          userId
        );
        onUserStoppedTyping?.(conversationId, userId);
      });

      conn.on("CrawlJobStatus", (status: CrawlJobStatusResponse) => {
        console.log("[CrawlerChatHub] CrawlJobStatus:", status);
        onCrawlJobStatus?.(status);
      });

      conn.on("CrawlJobProgressUpdate", (status: CrawlJobStatusResponse) => {
        console.log("[CrawlerChatHub] CrawlJobProgressUpdate:", status);
        onCrawlJobProgressUpdate?.(status);
      });

      conn.on("CrawlResultReady", (payload: any) => {
        console.log("[CrawlerChatHub] CrawlResultReady:", payload);
        onCrawlResultReady?.(payload);
      });

      conn.onclose((err) => {
        console.log("[CrawlerChatHub] onclose. error:", err);
        setConnected(false);
        setConnectionId(null);
      });

      conn.onreconnecting((err) => {
        console.log("[CrawlerChatHub] onreconnecting. error:", err);
        setConnected(false);
      });

      conn.onreconnected((newConnectionId) => {
        console.log(
          "[CrawlerChatHub] onreconnected. new connectionId:",
          newConnectionId
        );
        setConnected(true);
        setConnectionId(newConnectionId ?? conn.connectionId ?? null);
      });

      connectionRef.current = conn;
      return conn;
    };
  }, [
    baseUrl,
    hubPath,
    getAccessToken,
    onUserMessageReceived,
    onGroupMessageReceived,
    onCrawlerResponseReceived,
    onGroupCrawlerResponse,
    onAssignmentCrawlerResponse,
    onCrawlInitiated,
    onCrawlFailed,
    onMessageSent,
    onMessageError,
    onUserTyping,
    onUserStoppedTyping,
    onCrawlJobStatus,
    onCrawlJobProgressUpdate,
    onCrawlResultReady,
  ]);

  /** ===== Core connect (không debounce) ===== */
  const doConnect = useCallback(
    async () => {
      const conn = ensureConnection();
      console.log("[CrawlerChatHub] doConnect() called. conn:", conn);
      console.log("[CrawlerChatHub] current state:", conn.state);

      if (conn.state === signalR.HubConnectionState.Connected) {
        console.log("[CrawlerChatHub] already connected, skip start()");
        setConnected(true);
        setConnectionId(conn.connectionId ?? null);
        setLastError(null);
        return;
      }

      if (startInProgressRef.current) {
        console.log("[CrawlerChatHub] start already in progress, skip");
        return;
      }

      try {
        startInProgressRef.current = true;
        setConnecting(true);

        console.log("[CrawlerChatHub] calling conn.start()...");
        await conn.start();
        console.log(
          "[CrawlerChatHub] conn.start() done. state:",
          conn.state,
          "connectionId:",
          conn.connectionId
        );

        setConnected(true);
        setConnectionId(conn.connectionId ?? null);
        setLastError(null);
      } catch (e: any) {
        const rawMsg: string = e?.message ?? "";

        const isStrictModeRace =
          rawMsg.includes(
            "Failed to start the HttpConnection before stop() was called"
          ) ||
          rawMsg.includes(
            "Cannot start a HubConnection that is not in the 'Disconnected' state"
          ) ||
          rawMsg.includes(
            "The connection was stopped before the hub handshake could complete"
          );

        if (isStrictModeRace) {
          // 🟢 Lỗi do React StrictMode mount/unmount 2 lần → bỏ qua, KHÔNG set error / KHÔNG notify
          console.log(
            "[CrawlerChatHub] strict-mode start/stop race, ignoring error:",
            rawMsg
          );
        } else {
          console.warn("[CrawlerChatHub] connect error (real):", e);
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
    },
    [ensureConnection, onError]
  );

  /** ===== Public connect với debounce 200ms ===== */
  const connect = useCallback(
    async () => {
      if (connectPromiseRef.current) {
        console.log("[CrawlerChatHub] connect() reuse pending promise");
        return connectPromiseRef.current;
      }

      connectPromiseRef.current = new Promise<void>((resolve) => {
        if (connectTimeoutRef.current) {
          clearTimeout(connectTimeoutRef.current);
        }

        console.log("[CrawlerChatHub] connect() scheduled in", debounceMs, "ms");

        connectTimeoutRef.current = setTimeout(async () => {
          connectTimeoutRef.current = null;
          await doConnect();
          connectPromiseRef.current = null;
          resolve();
        }, debounceMs);
      });

      return connectPromiseRef.current;
    },
    [doConnect, debounceMs]
  );

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state === signalR.HubConnectionState.Disconnected) {
      console.log("[CrawlerChatHub] disconnect() but already disconnected");
      setConnected(false);
      setConnectionId(null);
      return;
    }

    try {
      console.log("[CrawlerChatHub] calling conn.stop()...");
      await conn.stop();
      console.log("[CrawlerChatHub] conn.stop() done");
    } finally {
      setConnected(false);
      setConnectionId(null);
    }
  }, []);

  /** ===== Hub method wrappers ===== */

  const joinConversation = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    console.log(
      "[CrawlerChatHub] joinConversation:",
      conversationId,
      conn?.state
    );
    if (!conn) return;
    await conn.invoke("JoinConversation", conversationId);
  }, []);

  const leaveConversation = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    console.log(
      "[CrawlerChatHub] leaveConversation:",
      conversationId,
      conn?.state
    );
    if (!conn) return;
    await conn.invoke("LeaveConversation", conversationId);
  }, []);

  const joinGroupWorkspace = useCallback(async (groupId: string) => {
    const conn = connectionRef.current;
    console.log("[CrawlerChatHub] joinGroupWorkspace:", groupId, conn?.state);
    if (!conn) return;
    await conn.invoke("JoinGroupWorkspace", groupId);
  }, []);

  const leaveGroupWorkspace = useCallback(async (groupId: string) => {
    const conn = connectionRef.current;
    console.log("[CrawlerChatHub] leaveGroupWorkspace:", groupId, conn?.state);
    if (!conn) return;
    await conn.invoke("LeaveGroupWorkspace", groupId);
  }, []);

  const subscribeToAssignment = useCallback(async (assignmentId: string) => {
    const conn = connectionRef.current;
    console.log(
      "[CrawlerChatHub] subscribeToAssignment:",
      assignmentId,
      conn?.state
    );
    if (!conn) return;
    await conn.invoke("SubscribeToAssignment", assignmentId);
  }, []);

  const unsubscribeFromAssignment = useCallback(
    async (assignmentId: string) => {
      const conn = connectionRef.current;
      console.log(
        "[CrawlerChatHub] unsubscribeFromAssignment:",
        assignmentId,
        conn?.state
      );
      if (!conn) return;
      await conn.invoke("UnsubscribeFromAssignment", assignmentId);
    },
    []
  );

  const sendCrawlerMessage = useCallback(async (msg: ChatMessageDto) => {
    const conn = connectionRef.current;

    console.log("===== [CrawlerChatHub] sendCrawlerMessage() START =====");
    console.log("[CrawlerChatHub] hub state:", conn?.state);
    console.log("[CrawlerChatHub] raw msg object:", msg);
    console.log(
      "[CrawlerChatHub] serialized msg:",
      JSON.stringify(msg, null, 2)
    );
    console.log("[CrawlerChatHub] typeof messageType:", typeof msg.messageType);
    console.log("[CrawlerChatHub] conversationId:", msg.conversationId);
    console.log("[CrawlerChatHub] userId:", msg.userId);
    console.log("===== [CrawlerChatHub] sendCrawlerMessage() END LOG =====");

    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      console.error("[CrawlerChatHub] Cannot send, hub not connected");
      throw new Error("CrawlerChatHub not connected");
    }

    try {
      await conn.invoke("SendCrawlerMessage", msg);
      console.log("[CrawlerChatHub] SendCrawlerMessage invoke OK");
    } catch (err: any) {
      console.error(
        "[CrawlerChatHub] SendCrawlerMessage invoke ERROR:",
        err?.message ?? err
      );
      throw err;
    }
  }, []);

  const userTyping = useCallback(
    async (conversationId: string, userId: string, userName: string) => {
      const conn = connectionRef.current;
      console.log(
        "[CrawlerChatHub] userTyping:",
        conversationId,
        userId,
        userName,
        conn?.state
      );
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
      await conn.invoke("UserTyping", conversationId, userId, userName);
    },
    []
  );

  const userStoppedTyping = useCallback(
    async (conversationId: string, userId: string) => {
      const conn = connectionRef.current;
      console.log(
        "[CrawlerChatHub] userStoppedTyping:",
        conversationId,
        userId,
        conn?.state
      );
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
      await conn.invoke("UserStoppedTyping", conversationId, userId);
    },
    []
  );

  const subscribeToCrawlJob = useCallback(
    async (jobId: string, conversationId: string) => {
      const conn = connectionRef.current;
      console.log(
        "[CrawlerChatHub] subscribeToCrawlJob:",
        jobId,
        conversationId,
        conn?.state
      );
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
      await conn.invoke("SubscribeToCrawlJob", jobId, conversationId);
    },
    []
  );

  const unsubscribeFromCrawlJob = useCallback(async (jobId: string) => {
    const conn = connectionRef.current;
    console.log(
      "[CrawlerChatHub] unsubscribeFromCrawlJob:",
      jobId,
      conn?.state
    );
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("UnsubscribeFromCrawlJob", jobId);
  }, []);

  const getServerConnectionId = useCallback(async (): Promise<string | null> => {
    const conn = connectionRef.current;
    console.log("[CrawlerChatHub] getServerConnectionId. state:", conn?.state);
    if (!conn || conn.state !== signalR.HubConnectionState.Connected)
      return null;
    try {
      const id = await conn.invoke<string>("GetConnectionId");
      console.log("[CrawlerChatHub] GetConnectionId ->", id);
      return id;
    } catch (err) {
      console.error("[CrawlerChatHub] GetConnectionId error:", err);
      return null;
    }
  }, []);

  return {
    connected,
    connecting,
    lastError,
    connectionId,
    connect,
    disconnect,
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
    getServerConnectionId,
    /** export helper nếu cần tạo GUID ở ngoài */
    generateGuid,
  };
}
