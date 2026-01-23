// src/services/agent-training.websocket.ts

import { io, Socket } from "socket.io-client";
import type {
  WebSocketMessage,
  WebSocketMessageType,
} from "@/types/agent-training/training.types";

const WS_URL =
  process.env.NEXT_PUBLIC_TRAINING_WS_URL ||
  "http://localhost:8091";

const RECONNECTION_DELAY = 1000;
const MAX_RECONNECTION_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<
    WebSocketMessageType | "all",
    Set<(data: any) => void>
  > = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionDelayMax: MAX_RECONNECTION_DELAY,
    });

    this.socket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Training WebSocket connected");
      }
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Training WebSocket disconnected");
      }
    });

    this.socket.on("message", (message: WebSocketMessage) => {
      this.handleMessage(message);
    });

    this.socket.on("crawl_log", (log: any) => {
      this.handleMessage({ type: "crawl_log", ...log });
    });

    this.socket.on("crawl_started", (data: any) => {
      this.handleMessage({ type: "crawl_started", ...data });
    });

    this.socket.on("pending_rollouts_updated", (data: any) => {
      this.handleMessage({ type: "pending_rollouts_updated", ...data });
    });

    this.socket.on("learning_cycle_complete", (data: any) => {
      this.handleMessage({ type: "learning_cycle_complete", ...data });
    });

    this.socket.on("training_queued", (data: any) => {
      this.handleMessage({ type: "training_queued", ...data });
    });

    this.socket.on("training_started", (data: any) => {
      this.handleMessage({ type: "training_started", ...data });
    });

    this.socket.on("training_completed", (data: any) => {
      this.handleMessage({ type: "training_completed", ...data });
    });

    this.socket.on("training_failed", (data: any) => {
      this.handleMessage({ type: "training_failed", ...data });
    });

    this.socket.on("job_completed", (data: any) => {
      console.log("[WS] Nhận job_completed từ Socket.IO:", data);
      this.handleMessage({ type: "job_completed", ...data });
    });

    this.socket.on("version_committed", (data: any) => {
      this.handleMessage({ type: "version_committed", ...data });
    });

    this.socket.on("version_created", (data: any) => {
      this.handleMessage({ type: "version_created", ...data });
    });

    this.socket.on("buffer_discarded", (data: any) => {
      this.handleMessage({ type: "buffer_discarded", ...data });
    });

    this.socket.on("buffer_created", (data: any) => {
      this.handleMessage({ type: "buffer_created", ...data });
    });

    this.socket.on("buffer_ready", (data: any) => {
      this.handleMessage({ type: "buffer_ready", ...data });
    });

    this.socket.on("queue_updated", (data: any) => {
      this.handleMessage({ type: "queue_updated", ...data });
    });

    this.socket.on("commit_progress", (data: any) => {
      this.handleMessage({ type: "commit_progress", ...data });
    });

    this.socket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Training WebSocket connection error:", error);
      }
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        if (process.env.NODE_ENV === "development") {
          console.error("Max reconnection attempts reached");
        }
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.reconnectAttempts = 0;
  }

  on(eventType: WebSocketMessageType | "all", handler: (data: any) => void) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)!.add(handler);
  }

  off(eventType: WebSocketMessageType | "all", handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    const allHandlers = this.messageHandlers.get("all");
    if (allHandlers) {
      allHandlers.forEach((handler) => handler(message));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  joinRoom(roomName: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_room", roomName);
      if (process.env.NODE_ENV === "development") {
        console.log(`Joining room: ${roomName}`);
      }
    }
  }

  leaveRoom(roomName: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave_room", roomName);
      if (process.env.NODE_ENV === "development") {
        console.log(`Leaving room: ${roomName}`);
      }
    }
  }

  subscribeDashboard() {
    if (this.socket?.connected) {
      this.socket.emit("subscribe_dashboard");
      if (process.env.NODE_ENV === "development") {
        console.log("Subscribed to dashboard updates");
      }
    }
  }

  joinAdminWorkspace(adminId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_admin_workspace", adminId);
      if (process.env.NODE_ENV === "development") {
        console.log(`Joined admin workspace: ${adminId}`);
      }
    }
  }

  joinTrainingSession(jobId: string) {
    this.joinRoom(`training_${jobId}`);
  }

  leaveTrainingSession(jobId: string) {
    this.leaveRoom(`training_${jobId}`);
  }

  // Gửi message qua WebSocket
  emit(eventName: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
      if (process.env.NODE_ENV === "development") {
        console.log(`Emitting event: ${eventName}`, data);
      }
    } else {
      console.error("Cannot emit: WebSocket not connected");
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
