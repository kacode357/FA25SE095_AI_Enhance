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
// Hook to manage SignalR Notification Hub connection and events
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

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              const tokenStr = typeof token === "string" ? token : "";
              return tokenStr;
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

      // ===== Hub events =====

      conn.on("ReceiveNotification", (notification: NotificationDto) => {
        onNotification?.(notification);

        if (onNotificationsBatch) {
          notifyBufferRef.current.push(notification);
          scheduleFlushNotifications();
        }
      });

      conn.on("UnreadCountRequested", (userId: string) => {
        if (!userId) return;
        onUnreadCountRequested?.(userId);
      });

      conn.on("Error", (message: string) => {
        setLastError(message);
        onError?.(message);
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

  const requestUnreadCount = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await conn.invoke("RequestUnreadCount");
    } catch (err) {
      // Silent error catch
    }
  }, []);

  const sendNotificationToUser = useCallback(
    async (userId: string, notification: NotificationDto) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
        throw new Error("NotificationHub not connected");
      }
      if (!userId) throw new Error("Missing userId");
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
      await conn.invoke("BroadcastNotification", notification);
    },
    []
  );

  return {
    connected,
    connecting,
    lastError,
    connectionId,
    connect,
    disconnect,
    requestUnreadCount,
    sendNotificationToUser,
    sendNotificationToUsers,
    broadcastNotification,
  };
}