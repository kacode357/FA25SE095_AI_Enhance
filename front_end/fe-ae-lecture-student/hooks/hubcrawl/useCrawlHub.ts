// hooks/hubcrawl/useCrawlHub.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export type JobStatsDto = any;
export type SystemMetricsDto = any;
export type JobUpdateDto = any;

type Options = {
  /** Base URL của WebCrawlerService (hub host) */
  baseUrl?: string;
  /** Lấy accessToken nếu hub có authorize */
  getAccessToken: () => Promise<string> | string;
  /** Nếu route khác /hubs/crawl thì override */
  hubPath?: string;

  onJobStats?: (stats: JobStatsDto) => void;
  onSystemMetrics?: (metrics: SystemMetricsDto) => void;

  onGroupJobUpdate?: (update: JobUpdateDto) => void;
  onAssignmentJobUpdate?: (update: JobUpdateDto) => void;
  onConversationJobUpdate?: (update: JobUpdateDto) => void;

  onError?: (message: string) => void;
};

/**
 * Hook SignalR cho CrawlHub:
 * - Connect idempotent (gọi nhiều lần cũng chỉ start 1 lần)
 * - Debounce connect 200ms để tránh spam / chuẩn bị crawl
 * - Nếu connect fail "thật" -> set lastError, KHÔNG tự retry nữa
 * - Subscribe chỉ invoke nếu state = Connected
 */
export function useCrawlHub({
  baseUrl = process.env.NEXT_PUBLIC_CRAWL_BASE_URL_HUB || "",
  hubPath = "/hubs/crawl",
  getAccessToken,
  onJobStats,
  onSystemMetrics,
  onGroupJobUpdate,
  onAssignmentJobUpdate,
  onConversationJobUpdate,
  onError,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);
  const connectFailedRef = useRef(false); // nếu đã fail thực sự -> ko auto connect nữa

  // debounce cho connect()
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectPromiseRef = useRef<Promise<void> | null>(null);

  /** ===== giữ callback mới nhất trong ref để không làm đổi deps ===== */
  const getAccessTokenRef = useRef(getAccessToken);
  const onJobStatsRef = useRef(onJobStats);
  const onSystemMetricsRef = useRef(onSystemMetrics);
  const onGroupJobUpdateRef = useRef(onGroupJobUpdate);
  const onAssignmentJobUpdateRef = useRef(onAssignmentJobUpdate);
  const onConversationJobUpdateRef = useRef(onConversationJobUpdate);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
  }, [getAccessToken]);
  useEffect(() => {
    onJobStatsRef.current = onJobStats;
  }, [onJobStats]);
  useEffect(() => {
    onSystemMetricsRef.current = onSystemMetrics;
  }, [onSystemMetrics]);
  useEffect(() => {
    onGroupJobUpdateRef.current = onGroupJobUpdate;
  }, [onGroupJobUpdate]);
  useEffect(() => {
    onAssignmentJobUpdateRef.current = onAssignmentJobUpdate;
  }, [onAssignmentJobUpdate]);
  useEffect(() => {
    onConversationJobUpdateRef.current = onConversationJobUpdate;
  }, [onConversationJobUpdate]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /** ===== Build connection (lazy, stable) ===== */
  const ensureConnection = useCallback((): signalR.HubConnection => {
    if (connectionRef.current) {
      return connectionRef.current;
    }

    const hubUrl = `${baseUrl.replace(/\/+$/, "")}${hubPath}`;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: async () => {
          try {
            const tokenFn = getAccessTokenRef.current;
            const token = await tokenFn();
            const tokenStr = typeof token === "string" ? token : "";
            return tokenStr;
          } catch {
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

    // ===== Hub events =====
    conn.on("OnJobStats", (stats: JobStatsDto) => {
      console.log("[HubCrawl] OnJobStats:", stats);
      onJobStatsRef.current?.(stats);
    });

    conn.on("OnSystemMetrics", (metrics: SystemMetricsDto) => {
      console.log("[HubCrawl] OnSystemMetrics:", metrics);
      onSystemMetricsRef.current?.(metrics);
    });

    conn.on("OnGroupJobUpdate", (update: JobUpdateDto) => {
      console.log("[HubCrawl] OnGroupJobUpdate:", update);
      onGroupJobUpdateRef.current?.(update);
    });

    conn.on("OnAssignmentJobUpdate", (update: JobUpdateDto) => {
      console.log("[HubCrawl] OnAssignmentJobUpdate:", update);
      onAssignmentJobUpdateRef.current?.(update);
    });

    conn.on("OnConversationJobUpdate", (update: JobUpdateDto) => {
      console.log("[HubCrawl] OnConversationJobUpdate:", update);
      onConversationJobUpdateRef.current?.(update);
    });

    conn.onclose((err) => {
      setConnected(false);
      setConnectionId(null);
    });

    conn.onreconnecting((err) => {
      setConnected(false);
    });

    conn.onreconnected((newConnectionId) => {
      setConnected(true);
      setConnectionId(newConnectionId ?? conn.connectionId ?? null);
    });

    connectionRef.current = conn;
    return conn;
  }, [baseUrl, hubPath]);

  /** ===== Core connect không debounce ===== */
  const doConnect = useCallback(async () => {
    const conn = ensureConnection();

    // Nếu đã từng fail thực sự rồi -> không tự connect nữa
    if (connectFailedRef.current) {
      return;
    }

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
      console.log("[HubCrawl] Connected successfully, connectionId:", conn.connectionId);
    } catch (e: any) {
      const rawMsg: string = e?.message ?? "";
      const isStrictModeRace =
        rawMsg.includes("Failed to start the HttpConnection before stop() was called") ||
        rawMsg.includes("Cannot start a HubConnection that is not in the 'Disconnected' state") ||
        rawMsg.includes("The connection was stopped before the hub handshake could complete");

      if (isStrictModeRace) {
        // lỗi do StrictMode / start-stop race -> bỏ qua, cho phép lần sau connect lại
      } else {
        const friendlyMsg = rawMsg || "Failed to connect CrawlHub";
        connectFailedRef.current = true; // chỉ đánh dấu fail cho lỗi thật
        setConnected(false);
        setConnectionId(null);
        setLastError(friendlyMsg);
        console.error("[HubCrawl] Connection failed:", friendlyMsg);
        onErrorRef.current?.(friendlyMsg);
      }
    } finally {
      setConnecting(false);
      startInProgressRef.current = false;
    }
  }, [ensureConnection]);

  /** ===== Public connect với debounce 200ms ===== */
  const connect = useCallback(async () => {
    // nếu đã có 1 promise connect đang pending (debounce hoặc đang chạy) thì reuse
    if (connectPromiseRef.current) {
      return connectPromiseRef.current;
    }

    connectPromiseRef.current = new Promise<void>((resolve) => {
      // clear timeout cũ nếu có
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }


      connectTimeoutRef.current = setTimeout(async () => {
        connectTimeoutRef.current = null;
        await doConnect();
        connectPromiseRef.current = null;
        resolve();
      }, 200);
    });

    return connectPromiseRef.current;
  }, [doConnect]);

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

  /** ===== Helper: check ready ===== */
  const getActiveConnection = () => {
    const conn = connectionRef.current;
    if (!conn) return null;
    if (conn.state !== signalR.HubConnectionState.Connected) return null;
    return conn;
  };

  /** ===== Hub method wrappers ===== */
  const subscribeToJob = useCallback(async (jobId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToJob", jobId);
  }, []);

  const unsubscribeFromJob = useCallback(async (jobId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("UnsubscribeFromJob", jobId);
  }, []);

  const subscribeToSystemMetrics = useCallback(async () => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToSystemMetrics");
  }, []);

  const unsubscribeFromSystemMetrics = useCallback(async () => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("UnsubscribeFromSystemMetrics");
  }, []);

  const subscribeToAllJobs = useCallback(async () => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToAllJobs");
  }, []);

  const unsubscribeFromAllJobs = useCallback(async () => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("UnsubscribeFromAllJobs");
  }, []);

  const subscribeToJobCharts = useCallback(async (jobId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToJobCharts", jobId);
  }, []);

  const unsubscribeFromJobCharts = useCallback(async (jobId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("UnsubscribeFromJobCharts", jobId);
  }, []);

  const subscribeToSystemCharts = useCallback(async () => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToSystemCharts");
  }, []);

  const unsubscribeFromSystemCharts = useCallback(async () => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("UnsubscribeFromSystemCharts");
  }, []);

  const subscribeToGroupJobs = useCallback(async (groupId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToGroupJobs", groupId);
  }, []);

  const unsubscribeFromGroupJobs = useCallback(async (groupId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("UnsubscribeFromGroupJobs", groupId);
  }, []);

  const subscribeToAssignmentJobs = useCallback(async (assignmentId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToAssignmentJobs", assignmentId);
  }, []);

  const unsubscribeFromAssignmentJobs = useCallback(
    async (assignmentId: string) => {
      const conn = getActiveConnection();
      if (!conn) return;
      await conn.invoke("UnsubscribeFromAssignmentJobs", assignmentId);
    },
    []
  );

  const subscribeToConversation = useCallback(async (conversationId: string) => {
    const conn = getActiveConnection();
    if (!conn) return;
    await conn.invoke("SubscribeToConversation", conversationId);
  }, []);

  const unsubscribeFromConversation = useCallback(
    async (conversationId: string) => {
      const conn = getActiveConnection();
      if (!conn) return;
      await conn.invoke("UnsubscribeFromConversation", conversationId);
    },
    []
  );

  const getServerConnectionId = useCallback(async (): Promise<string | null> => {
    const conn = getActiveConnection();
    if (!conn) return null;
    try {
      const id = await conn.invoke<string>("GetConnectionId");
      return id;
    } catch {
      return null;
    }
  }, []);

  return {
    // state
    connected,
    connecting,
    lastError,
    connectionId,

    // connection control
    connect,
    disconnect,

    // subscribe APIs
    subscribeToJob,
    unsubscribeFromJob,
    subscribeToSystemMetrics,
    unsubscribeFromSystemMetrics,
    subscribeToAllJobs,
    unsubscribeFromAllJobs,
    subscribeToJobCharts,
    unsubscribeFromJobCharts,
    subscribeToSystemCharts,
    unsubscribeFromSystemCharts,
    subscribeToGroupJobs,
    unsubscribeFromGroupJobs,
    subscribeToAssignmentJobs,
    unsubscribeFromAssignmentJobs,
    subscribeToConversation,
    unsubscribeFromConversation,
    getServerConnectionId,
  };
}
