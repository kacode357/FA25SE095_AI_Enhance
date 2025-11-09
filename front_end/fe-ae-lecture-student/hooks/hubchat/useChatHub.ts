// hooks/useChatHub.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { SendMessageDto, ChatMessageDto } from "@/types/chat/chat";
type Options = {
  baseUrl?: string; // default classroom url
  getAccessToken: () => Promise<string> | string; // hàm lấy JWT
  onReceiveMessage?: (msg: ChatMessageDto) => void;
  onTyping?: (payload: { userId: string; isTyping: boolean }) => void;
  onError?: (message: string) => void;
};

export function useChatHub({
  baseUrl = "https://classroom.fishmakeweb.id.vn",
  getAccessToken,
  onReceiveMessage,
  onTyping,
  onError,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // tạo connection 1 lần
  const createConnection = useMemo(() => {
    return new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/chat`, {
        accessTokenFactory: async () => {
          const token = await getAccessToken();
          return typeof token === "string" ? token : "";
        },
        transport: signalR.HttpTransportType.WebSockets, // ưu tiên WS
        skipNegotiation: true, // vì đã chọn WebSockets
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // backoff nhẹ nhàng 0.5s, 1s, 2s, 5s...
          const delays = [500, 1000, 2000, 5000, 10000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  // khởi động và gắn handler
  useEffect(() => {
    const conn = createConnection;
    connectionRef.current = conn;

    const start = async () => {
      if (conn.state === signalR.HubConnectionState.Connected || connecting) return;
      try {
        setConnecting(true);
        await conn.start();
        setConnected(true);
      } catch (e) {
        setConnected(false);
      } finally {
        setConnecting(false);
      }
    };

    // event từ server
    conn.on("ReceiveMessage", (msg: ChatMessageDto) => {
      onReceiveMessage?.(msg);
    });

    conn.on("MessageSent", (msg: ChatMessageDto) => {
      // có thể cũng đẩy vào UI gửi thành công
      onReceiveMessage?.(msg);
    });

    conn.on("UserTyping", (payload: { userId: string; isTyping: boolean }) => {
      onTyping?.(payload);
    });

    conn.on("Error", (message: string) => {
      onError?.(message);
    });

    // lifecycle
    conn.onclose(() => setConnected(false));
    conn.onreconnected(() => setConnected(true));
    conn.onreconnecting(() => setConnected(false));

    // start ngay
    start();

    return () => {
      conn.stop().catch(() => {});
      connectionRef.current = null;
    };
  }, [createConnection, onReceiveMessage, onTyping, onError, connecting]);

  // APIs gọi hub
  const sendMessage = useCallback(async (dto: SendMessageDto) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error("Not connected");
    }

    // validate nhanh bên FE cho mượt
    if (!dto.message?.trim()) throw new Error("Message cannot be empty");
    if (dto.message.length > 2000) throw new Error("Message too long (max 2000 chars)");
    if (!dto.receiverId) throw new Error("Missing receiverId");
    if (!dto.courseId) throw new Error("Missing courseId");

    await conn.invoke("SendMessage", {
      message: dto.message,
      receiverId: dto.receiverId,
      courseId: dto.courseId,
    } as SendMessageDto);
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

  return {
    connected,
    connecting,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
