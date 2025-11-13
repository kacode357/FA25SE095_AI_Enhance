// hooks/hubnotification/useNotificationHub.ts
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export type NotificationDto = any;

type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;
  onNotification?: (notification: NotificationDto) => void;
  onNotificationsBatch?: (notifications: NotificationDto[]) => void;
  onUnreadCountRequested?: (userId: string) => void;
  onError?: (message: string) => void;
  debounceMs?: number;
};

export function useNotificationHub({
  baseUrl =
    process.env.NEXT_PUBLIC_NOTIFICATION_BASE_URL ||
    "https://noti.fishmakeweb.id.vn",
  getAccessToken,
  onNotification,
  onNotificationsBatch,
  onUnreadCountRequested,
  onError,
  debounceMs = 500,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);

  // ===== batch buffer =====
  const notifyBufferRef = useRef<NotificationDto[]>([]);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushNotifications = useCallback(() => {
    if (!onNotificationsBatch) return;
    const buf = notifyBufferRef.current;
    if (!buf.length) return;
    notifyBufferRef.current = [];
    onNotificationsBatch(buf);
  }, [onNotificationsBatch]);

  const scheduleFlushNotifications = useCallback(() => {
    if (!onNotificationsBatch) return;
    if (notifyTimerRef.current) return;

    notifyTimerRef.current = setTimeout(() => {
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = null;
      flushNotifications();
    }, debounceMs);
  }, [flushNotifications, debounceMs, onNotificationsBatch]);

  // ===== Build connection (lazy) =====
  const ensureConnection = useMemo(() => {
    return () => {
      if (connectionRef.current) return connectionRef.current;

      const hubUrl = `${baseUrl.replace(/\/+$/, "")}/hubs/notifications`;
      console.log("[NotificationHub] build connection:", hubUrl);

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              const tokenStr = typeof token === "string" ? token : "";
              console.log(
                "[NotificationHub] accessTokenFactory got token:",
                tokenStr ? tokenStr.slice(0, 25) + "..." : "(EMPTY)"
              );
              return tokenStr;
            } catch (err) {
              console.error("[NotificationHub] accessTokenFactory error:", err);
              return "";
            }
          },
          // KHÔNG dùng skipNegotiation nữa => server sẽ trả connectionId chuẩn
          // transport: signalR.HttpTransportType.WebSockets,
          // skipNegotiation: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (ctx) => {
            const delays = [500, 1000, 2000, 5000, 10000];
            return delays[Math.min(ctx.previousRetryCount, delays.length - 1)];
          },
        })
        // Nếu muốn xem log chi tiết thì đổi sang LogLevel.Information
        .configureLogging(signalR.LogLevel.None)
        .build();

      // ===== Hub events =====

      conn.on("ReceiveNotification", (notification: NotificationDto) => {
        console.log("[NotificationHub] ReceiveNotification:", notification);
        onNotification?.(notification);

        if (onNotificationsBatch) {
          notifyBufferRef.current.push(notification);
          scheduleFlushNotifications();
        }
      });

      conn.on("UnreadCountRequested", (userId: string) => {
        console.log("[NotificationHub] UnreadCountRequested:", userId);
        if (!userId) return;
        onUnreadCountRequested?.(userId);
      });

      conn.on("Error", (message: string) => {
        console.error("[NotificationHub] server Error event:", message);
        setLastError(message);
        onError?.(message);
      });

      conn.onclose((err) => {
        console.log("[NotificationHub] onclose. error:", err);
        setConnected(false);
        setConnectionId(null);
      });

      conn.onreconnecting((err) => {
        console.log("[NotificationHub] onreconnecting. error:", err);
        setConnected(false);
        // giữ connectionId cũ hoặc clear cũng được, ở đây tao giữ
      });

      conn.onreconnected((newConnectionId) => {
        console.log(
          "[NotificationHub] onreconnected. new connectionId:",
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
    getAccessToken,
    onNotification,
    onNotificationsBatch,
    scheduleFlushNotifications,
    onUnreadCountRequested,
    onError,
  ]);

  // ===== Public APIs =====

  const connect = useCallback(async () => {
    const conn = ensureConnection();
    console.log("[NotificationHub] connect() called. current state:", conn);
    console.log(
      "[NotificationHub] connect() called. current state:",
      conn.state
    );

    if (conn.state === signalR.HubConnectionState.Connected) {
      console.log("[NotificationHub] already connected, skip start()");
      setConnected(true);
      setConnectionId(conn.connectionId ?? null);
      setLastError(null);
      return;
    }

    if (startInProgressRef.current) {
      console.log("[NotificationHub] start already in progress, skip");
      return;
    }

    try {
      startInProgressRef.current = true;
      setConnecting(true);

      console.log("[NotificationHub] calling conn.start()...");
      await conn.start();
      console.log(
        "[NotificationHub] conn.start() done. state:",
        conn.state,
        "connectionId:",
        conn.connectionId
      );

      setConnected(true);
      setConnectionId(conn.connectionId ?? null);
      setLastError(null);
    } catch (e: any) {
      const rawMsg: string = e?.message ?? "";
      const isStrictModeStop =
        rawMsg.includes("Failed to start the HttpConnection before stop() was called");

      if (isStrictModeStop) {
        console.log(
          "[NotificationHub] strict-mode start/stop race, ignoring error:",
          rawMsg
        );
      } else {
        console.warn("[NotificationHub] connect error (real):", e);
        const friendlyMsg = rawMsg || "Failed to connect NotificationHub";
        setConnected(false);
        setConnectionId(null);
        setLastError(friendlyMsg);
        onError?.(friendlyMsg);
      }
      // không throw ra ngoài
    } finally {
      setConnecting(false);
      startInProgressRef.current = false;
    }
  }, [ensureConnection, onError]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state === signalR.HubConnectionState.Disconnected) {
      console.log("[NotificationHub] disconnect() but already disconnected");
      setConnected(false);
      setConnectionId(null);
      return;
    }

    try {
      console.log("[NotificationHub] calling conn.stop()...");
      await conn.stop();
      console.log("[NotificationHub] conn.stop() done");
    } finally {
      setConnected(false);
      setConnectionId(null);
    }
  }, []);

  const requestUnreadCount = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      console.log("[NotificationHub] requestUnreadCount() but not connected");
      return;
    }

    try {
      console.log("[NotificationHub] invoke RequestUnreadCount");
      await conn.invoke("RequestUnreadCount");
    } catch (err) {
      console.error("[NotificationHub] RequestUnreadCount error:", err);
    }
  }, []);

  const sendNotificationToUser = useCallback(
    async (userId: string, notification: NotificationDto) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
        throw new Error("NotificationHub not connected");
      }
      if (!userId) throw new Error("Missing userId");
      console.log("[NotificationHub] SendNotificationToUser:", userId, notification);
      await conn.invoke("SendNotificationToUser", userId, notification);
    },
    []
  );

  const sendNotificationToUsers = useCallback(
    async (userIds: string[], notification: NotificationDto) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
        throw new Error("NotificationHub not connected");
      }
      if (!userIds?.length) throw new Error("userIds is empty");
      console.log("[NotificationHub] SendNotificationToUsers:", userIds, notification);
      await conn.invoke("SendNotificationToUsers", userIds, notification);
    },
    []
  );

  const broadcastNotification = useCallback(
    async (notification: NotificationDto) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
        throw new Error("NotificationHub not connected");
      }
      console.log("[NotificationHub] BroadcastNotification:", notification);
      await conn.invoke("BroadcastNotification", notification);
    },
    []
  );

  return {
    connected,
    connecting,
    lastError,
    connectionId, // ⭐ thêm cho mày debug
    connect,
    disconnect,
    requestUnreadCount,
    sendNotificationToUser,
    sendNotificationToUsers,
    broadcastNotification,
  };
}
