// hooks/hubchat/useChatHub.ts
"use client";

import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type { ChatMessageItemResponse as ChatMessageDto } from "@/types/chat/chat.response";
import * as signalR from "@microsoft/signalr";
import { useCallback, useMemo, useRef, useState } from "react";

type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;
  onReceiveMessage?: (msg: ChatMessageDto) => void;
  onReceiveMessagesBatch?: (msgs: ChatMessageDto[]) => void;
  onTyping?: (payload: { userId: string; isTyping: boolean }) => void;
  onError?: (message: string) => void;
  onMessageDeleted?: (messageId: string) => void; // vẫn giữ listener nếu sau này BE phát
  debounceMs?: number;
};

export function useChatHub({
  baseUrl = "https://classroom.fishmakeweb.id.vn",
  getAccessToken,
  onReceiveMessage,
  onReceiveMessagesBatch,
  onTyping,
  onError,
  onMessageDeleted,
  debounceMs = 500,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);

  // ===== batch buffer =====
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

  // ===== Build connection (lazy) =====
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

      // ===== Hub events =====
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

      conn.on("UserTyping", (p: { userId: string; isTyping: boolean }) => {
        if (!p?.userId) return;
        onTyping?.({ userId: p.userId, isTyping: !!p.isTyping });
      });

      // Nếu BE bổ sung broadcast xóa, FE tự nhận:
      // await Clients.All.SendAsync("MessageDeleted", new { messageId });
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
    onError,
    onMessageDeleted,
  ]);

  // ===== Public APIs =====
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

  const sendMessage = useCallback(async (dto: SendMessagePayload) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error("Not connected");
    }
    if (!dto.message?.trim()) throw new Error("Message cannot be empty");
    if (dto.message.length > 2000) throw new Error("Message too long (max 2000 chars)");
    if (!dto.receiverId) throw new Error("Missing receiverId");
    if (!dto.courseId) throw new Error("Missing courseId");
    await conn.invoke("SendMessage", dto);
  }, []);

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

  // Giữ lại: gọi tới method "DeleteMessage" nếu có. Nếu BE chưa có -> FE catch/ignore.
  const deleteMessageHub = useCallback(async (messageId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    try {
      await conn.invoke("DeleteMessage", { messageId });
    } catch {
      // BE có thể chưa triển khai, bỏ qua
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
  };
}
