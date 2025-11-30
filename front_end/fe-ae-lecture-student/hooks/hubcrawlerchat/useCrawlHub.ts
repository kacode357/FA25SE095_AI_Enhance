"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

/** Tùy loại payload BE trả (job stats / metrics / updates) */
export type CrawlJobStats = any;
export type CrawlSystemMetrics = any;
export type CrawlJobUpdate = any;

type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;

  // ===== callbacks: server -> client =====
  onConnectedChange?: (connected: boolean) => void;

  onJobStats?: (stats: CrawlJobStats) => void;
  onJobStarted?: (payload: CrawlJobUpdate) => void;
  onJobProgress?: (payload: CrawlJobUpdate) => void;
  onJobCompleted?: (payload: CrawlJobUpdate) => void;

  onJobNavigation?: (payload: CrawlJobUpdate) => void;
  onJobPagination?: (payload: CrawlJobUpdate) => void;
  onJobExtraction?: (payload: CrawlJobUpdate) => void;

  onSystemMetrics?: (metrics: CrawlSystemMetrics) => void;

  onGroupJobUpdate?: (payload: CrawlJobUpdate) => void;
  onAssignmentJobUpdate?: (payload: CrawlJobUpdate) => void;
  onConversationJobUpdate?: (payload: CrawlJobUpdate) => void;

  onError?: (message: string) => void;
};

export function useCrawlHub({
  baseUrl = "https://crawl.fishmakeweb.id.vn",
  getAccessToken,
  onConnectedChange,
  onJobStats,
  onJobStarted,
  onJobProgress,
  onJobCompleted,
  onJobNavigation,
  onJobPagination,
  onJobExtraction,
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

  // ===== build connection (lazy) =====
  const ensureConnection = useMemo(() => {
    return () => {
      if (connectionRef.current) return connectionRef.current;

      const hubUrl = `${baseUrl.replace(/\/+$/, "")}/hubs/crawl`;

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              return typeof token === "string" ? token : "";
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

      // ===== đăng ký event từ CrawlHub (server -> client) =====

      conn.on("OnJobStats", (stats: CrawlJobStats) => {
        console.log("[CrawlHub] OnJobStats:", stats);
        onJobStats?.(stats);
      });

      conn.on("OnJobStarted", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnJobStarted:", payload);
        onJobStarted?.(payload);
      });

      conn.on("OnJobProgress", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnJobProgress:", payload);
        onJobProgress?.(payload);
      });

      conn.on("OnJobCompleted", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnJobCompleted:", payload);
        onJobCompleted?.(payload);
      });

      conn.on("OnJobNavigation", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnJobNavigation:", payload);
        onJobNavigation?.(payload);
      });

      conn.on("OnJobPagination", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnJobPagination:", payload);
        onJobPagination?.(payload);
      });

      conn.on("OnJobExtraction", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnJobExtraction:", payload);
        onJobExtraction?.(payload);
      });

      conn.on("OnSystemMetrics", (metrics: CrawlSystemMetrics) => {
        console.log("[CrawlHub] OnSystemMetrics:", metrics);
        onSystemMetrics?.(metrics);
      });

      conn.on("OnGroupJobUpdate", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnGroupJobUpdate:", payload);
        onGroupJobUpdate?.(payload);
      });

      conn.on("OnAssignmentJobUpdate", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnAssignmentJobUpdate:", payload);
        onAssignmentJobUpdate?.(payload);
      });

      conn.on("OnConversationJobUpdate", (payload: CrawlJobUpdate) => {
        console.log("[CrawlHub] OnConversationJobUpdate:", payload);
        onConversationJobUpdate?.(payload);
      });

      conn.onclose(() => {
        setConnected(false);
        setConnectionId(null);
        onConnectedChange?.(false);
      });

      conn.onreconnecting(() => {
        setConnected(false);
        onConnectedChange?.(false);
      });

      conn.onreconnected((newConnectionId) => {
        setConnected(true);
        setConnectionId(newConnectionId ?? conn.connectionId ?? null);
        onConnectedChange?.(true);
      });

      connectionRef.current = conn;
      return conn;
    };
  }, [
    baseUrl,
    getAccessToken,
    onJobStats,
    onJobStarted,
    onJobProgress,
    onJobCompleted,
    onJobNavigation,
    onJobPagination,
    onJobExtraction,
    onSystemMetrics,
    onGroupJobUpdate,
    onAssignmentJobUpdate,
    onConversationJobUpdate,
    onConnectedChange,
  ]);

  // ===== public APIs =====

  const connect = useCallback(async () => {
    const conn = ensureConnection();

    if (conn.state === signalR.HubConnectionState.Connected) {
      setConnected(true);
      setConnectionId(conn.connectionId ?? null);
      setLastError(null);
      onConnectedChange?.(true);
      return;
    }

    if (startInProgressRef.current) return;

    try {
      startInProgressRef.current = true;
      setConnecting(true);

      await conn.start();

      setConnected(true);
      setConnectionId(conn.connectionId ?? null);
      setLastError(null);
      onConnectedChange?.(true);

      console.log("[CrawlHub] Connected");
    } catch (e: any) {
      const rawMsg: string = e?.message ?? "";
      const isStrictModeStop = rawMsg.includes(
        "Failed to start the HttpConnection before stop() was called"
      );

      if (!isStrictModeStop) {
        const friendlyMsg = rawMsg || "Failed to connect CrawlHub";
        setConnected(false);
        setConnectionId(null);
        setLastError(friendlyMsg);
        onError?.(friendlyMsg);
        console.error("[CrawlHub] connect error:", e);
      }
    } finally {
      setConnecting(false);
      startInProgressRef.current = false;
    }
  }, [ensureConnection, onConnectedChange, onError]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state === signalR.HubConnectionState.Disconnected) {
      setConnected(false);
      setConnectionId(null);
      onConnectedChange?.(false);
      return;
    }

    try {
      await conn.stop();
    } finally {
      setConnected(false);
      setConnectionId(null);
      onConnectedChange?.(false);
      console.log("[CrawlHub] Disconnected");
    }
  }, [onConnectedChange]);

  // ===== wrapper methods (client -> server) =====

  const subscribeToJob = useCallback(
    async (jobId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) {
        await connect();
      }
      console.log("[CrawlHub] SubscribeToJob:", jobId);
      await conn.invoke("SubscribeToJob", jobId);
    },
    [ensureConnection, connect]
  );

  const unsubscribeFromJob = useCallback(
    async (jobId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) return;
      console.log("[CrawlHub] UnsubscribeFromJob:", jobId);
      await conn.invoke("UnsubscribeFromJob", jobId);
    },
    [ensureConnection]
  );

  const subscribeToSystemMetrics = useCallback(async () => {
    const conn = ensureConnection();
    if (conn.state !== signalR.HubConnectionState.Connected) {
      await connect();
    }
    console.log("[CrawlHub] SubscribeToSystemMetrics");
    await conn.invoke("SubscribeToSystemMetrics");
  }, [ensureConnection, connect]);

  const unsubscribeFromSystemMetrics = useCallback(async () => {
    const conn = ensureConnection();
    if (conn.state !== signalR.HubConnectionState.Connected) return;
    console.log("[CrawlHub] UnsubscribeFromSystemMetrics");
    await conn.invoke("UnsubscribeFromSystemMetrics");
  }, [ensureConnection]);

  const subscribeToAllJobs = useCallback(async () => {
    const conn = ensureConnection();
    if (conn.state !== signalR.HubConnectionState.Connected) {
      await connect();
    }
    console.log("[CrawlHub] SubscribeToAllJobs");
    await conn.invoke("SubscribeToAllJobs");
  }, [ensureConnection, connect]);

  const unsubscribeFromAllJobs = useCallback(async () => {
    const conn = ensureConnection();
    if (conn.state !== signalR.HubConnectionState.Connected) return;
    console.log("[CrawlHub] UnsubscribeFromAllJobs");
    await conn.invoke("UnsubscribeFromAllJobs");
  }, [ensureConnection]);

  const subscribeToGroupJobs = useCallback(
    async (groupId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) {
        await connect();
      }
      console.log("[CrawlHub] SubscribeToGroupJobs:", groupId);
      await conn.invoke("SubscribeToGroupJobs", groupId);
    },
    [ensureConnection, connect]
  );

  const unsubscribeFromGroupJobs = useCallback(
    async (groupId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) return;
      console.log("[CrawlHub] UnsubscribeFromGroupJobs:", groupId);
      await conn.invoke("UnsubscribeFromGroupJobs", groupId);
    },
    [ensureConnection]
  );

  const subscribeToAssignmentJobs = useCallback(
    async (assignmentId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) {
        await connect();
      }
      console.log("[CrawlHub] SubscribeToAssignmentJobs:", assignmentId);
      await conn.invoke("SubscribeToAssignmentJobs", assignmentId);
    },
    [ensureConnection, connect]
  );

  const unsubscribeFromAssignmentJobs = useCallback(
    async (assignmentId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) return;
      console.log("[CrawlHub] UnsubscribeFromAssignmentJobs:", assignmentId);
      await conn.invoke("UnsubscribeFromAssignmentJobs", assignmentId);
    },
    [ensureConnection]
  );

  const subscribeToConversation = useCallback(
    async (conversationId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) {
        await connect();
      }
      console.log("[CrawlHub] SubscribeToConversation:", conversationId);
      await conn.invoke("SubscribeToConversation", conversationId);
    },
    [ensureConnection, connect]
  );

  const unsubscribeFromConversation = useCallback(
    async (conversationId: string) => {
      const conn = ensureConnection();
      if (conn.state !== signalR.HubConnectionState.Connected) return;
      console.log("[CrawlHub] UnsubscribeFromConversation:", conversationId);
      await conn.invoke("UnsubscribeFromConversation", conversationId);
    },
    [ensureConnection]
  );

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
    subscribeToGroupJobs,
    unsubscribeFromGroupJobs,
    subscribeToAssignmentJobs,
    unsubscribeFromAssignmentJobs,
    subscribeToConversation,
    unsubscribeFromConversation,
  };
}
