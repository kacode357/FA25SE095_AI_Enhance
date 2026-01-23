"use client";

import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type { ChatMessageItemResponse as ChatMessageDto } from "@/types/chat/chat.response";
import * as signalR from "@microsoft/signalr";
import { useCallback, useMemo, useRef, useState } from "react";

type UnreadPayload = { userId: string; unreadCount: number };

type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;
  onReceiveMessage?: (msg: ChatMessageDto) => void;
  onReceiveMessagesBatch?: (msgs: ChatMessageDto[]) => void;
  onTyping?: (payload: { userId: string; isTyping: boolean }) => void;
  onUnreadCountChanged?: (payload: UnreadPayload) => void;
  onUnreadCountsBatch?: (payload: UnreadPayload[]) => void;
  onError?: (message: string) => void;
  onMessageDeleted?: (messageId: string) => void;
  debounceMs?: number;
};

export function useChatHub({
  baseUrl = process.env.NEXT_PUBLIC_COURSE_BASE_URL_HUB,
  getAccessToken,
  onReceiveMessage,
  onReceiveMessagesBatch,
  onTyping,
  onUnreadCountChanged,
  onUnreadCountsBatch,
  onError,
  onMessageDeleted,
  debounceMs = 500,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);

  /** Bộ đệm để gom nhóm tin nhắn trước khi gửi batch */
  const msgBufferRef = useRef<ChatMessageDto[]>([]);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushMessages = useCallback(() => {
    if (!onReceiveMessagesBatch) return;
    const buf = msgBufferRef.current;
    if (!buf.length) return;
    msgBufferRef.current = [];
    onReceiveMessagesBatch(buf);
  }, [onReceiveMessagesBatch]);

  const scheduleFlushMessages = useCallback(() => {
    if (!onReceiveMessagesBatch) return;
    if (msgTimerRef.current) return;
    msgTimerRef.current = setTimeout(() => {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
      msgTimerRef.current = null;
      flushMessages();
    }, debounceMs);
  }, [flushMessages, debounceMs, onReceiveMessagesBatch]);

  /** Khởi tạo kết nối SignalR (lazy loading) */
  const ensureConnection = useMemo(() => {
    return () => {
      if (connectionRef.current) return connectionRef.current;

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/chat`, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              return typeof token === "string" ? token : "";
            } catch {
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
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      /** Đăng ký các sự kiện từ Hub (server -> client) */

      /** Nhận tin nhắn realtime (cả riêng lẻ và batch) */
      conn.on("ReceiveMessage", (msg: ChatMessageDto) => {
        onReceiveMessage?.(msg);
        if (onReceiveMessagesBatch) {
          msgBufferRef.current.push(msg);
          scheduleFlushMessages();
        }
      });

      conn.on("MessageSent", (msg: ChatMessageDto) => {
        onReceiveMessage?.(msg);
        if (onReceiveMessagesBatch) {
          msgBufferRef.current.push(msg);
          scheduleFlushMessages();
        }
      });

      /** Trạng thái đang gõ */
      conn.on("UserTyping", (p: { userId: string; isTyping: boolean }) => {
        if (!p?.userId) return;
        onTyping?.({ userId: p.userId, isTyping: !!p.isTyping });
      });

      /** Số tin chưa đọc của 1 user (server gửi khi có tin mới / đánh dấu đã đọc) */
      conn.on(
        "UnreadCountChanged",
        (p: { userId: string; unreadCount: number }) => {
          if (!p?.userId) return;
          onUnreadCountChanged?.({
            userId: String(p.userId),
            unreadCount: Number(p.unreadCount || 0),
          });
        },
      );

      /** Số tin chưa đọc theo batch (nếu server sử dụng) */
      conn.on(
        "UnreadCounts",
        (items: Array<{ userId: string; unreadCount: number }>) => {
          if (!Array.isArray(items) || !items.length) return;
          onUnreadCountsBatch?.(
            items.map((it) => ({
              userId: String(it.userId),
              unreadCount: Number(it.unreadCount || 0),
            })),
          );
        },
      );

      /** Xóa tin nhắn */
      conn.on("MessageDeleted", (payload: { messageId: string }) => {
        if (!payload?.messageId) return;
        onMessageDeleted?.(payload.messageId);
      });

      conn.on("Error", (message: string) => {
        setLastError(message);
        onError?.(message);
      });

      conn.onclose(() => setConnected(false));
      conn.onreconnected(() => setConnected(true));
      conn.onreconnecting(() => setConnected(false));

      connectionRef.current = conn;
      return conn;
    };
  }, [
    baseUrl,
    getAccessToken,
    onReceiveMessage,
    onReceiveMessagesBatch,
    scheduleFlushMessages,
    onTyping,
    onUnreadCountChanged,
    onUnreadCountsBatch,
    onError,
    onMessageDeleted,
  ]);

  /** Các phương thức public để tương tác với Hub */
  const connect = useCallback(async () => {
    const conn = ensureConnection();
    if (conn.state === signalR.HubConnectionState.Connected) return;
    if (startInProgressRef.current) return;

    try {
      startInProgressRef.current = true;
      setConnecting(true);
      await conn.start();
      setConnected(true);
      setLastError(null);
    } catch (e: any) {
      setConnected(false);
      const msg = e?.message ?? "Failed to connect";
      setLastError(msg);
      onError?.("Failed to connect to chat");
      throw e;
    } finally {
      setConnecting(false);
      startInProgressRef.current = false;
    }
  }, [ensureConnection, onError]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
      try {
        await conn.stop();
      } finally {
        setConnected(false);
      }
    }
  }, []);

  const sendMessage = useCallback(
    async (dto: SendMessagePayload) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
        throw new Error("Not connected");
      }

      if (!dto.message?.trim()) throw new Error("Message cannot be empty");
      if (dto.message.length > 2000)
        throw new Error("Message too long (max 2000 chars)");
      if (!dto.receiverId) throw new Error("Missing receiverId");
      if (!dto.courseId) throw new Error("Missing courseId");

      const payload = {
        message: dto.message.trim(),
        receiverId: dto.receiverId,
        courseId: dto.courseId,
        conversationId: dto.conversationId || null,
        supportRequestId: dto.supportRequestId || null,
      };

      await conn.invoke("SendMessage", payload);
    },
    [],
  );

  const startTyping = useCallback(async (receiverId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("StartTyping", receiverId);
  }, []);

  const stopTyping = useCallback(async (receiverId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("StopTyping", receiverId);
  }, []);

  const deleteMessageHub = useCallback(async (messageId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    try {
      await conn.invoke("DeleteMessage", { messageId });
    } catch {
      // ignore
    }
  }, []);

  /** Đánh dấu các tin nhắn đã đọc cho 1 conversation */
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    try {
      await conn.invoke("MarkMessagesAsRead", conversationId);
    } catch {
      // ignore
    }
  }, []);

  return {
    connected,
    connecting,
    lastError,
    connect,
    disconnect,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessageHub,
    markMessagesAsRead,
  };
}
