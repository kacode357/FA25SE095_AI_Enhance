/**
 * WebSocket Service cho Agent Training
 * 
 * Quản lý kết nối real-time với Training Backend qua Socket.IO
 * Nhận các events: crawl logs, training status, buffer updates, version commits
 */

import { io, Socket } from "socket.io-client";
import type { WebSocketMessage, WebSocketMessageType } from "@/types/agent-training/training.types";

// ============================================================
// CẤU HÌNH KẾT NỐI
// ============================================================

const WS_URL = process.env.NEXT_PUBLIC_TRAINING_WS_URL || "http://localhost:8091";
const RECONNECTION_DELAY = 1000;      // Thời gian chờ trước khi reconnect (ms)
const MAX_RECONNECTION_DELAY = 5000;  // Thời gian chờ tối đa (ms)
const MAX_RECONNECT_ATTEMPTS = 5;     // Số lần thử reconnect tối đa

// ============================================================
// WEBSOCKET SERVICE CLASS
// ============================================================

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<WebSocketMessageType | "all", Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;

  // ------------------------------------------------------------
  // KẾT NỐI VÀ ĐĂNG KÝ EVENTS
  // ------------------------------------------------------------

  /** Kết nối tới Training WebSocket server */
  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionDelayMax: MAX_RECONNECTION_DELAY,
    });

    this.registerConnectionEvents();
    this.registerTrainingEvents();
  }

  /** Đăng ký các events liên quan đến connection */
  private registerConnectionEvents(): void {
    if (!this.socket) return;

    // Kết nối thành công
    this.socket.on("connect", () => {
      console.log("[WS] ✓ Đã kết nối Training WebSocket");
      this.reconnectAttempts = 0;
    });

    // Mất kết nối
    this.socket.on("disconnect", () => {
      console.log("[WS] ✗ Mất kết nối WebSocket");
    });

    // Lỗi kết nối
    this.socket.on("connect_error", (error) => {
      console.error("[WS] Lỗi kết nối:", error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error("[WS] Đã vượt quá số lần thử kết nối lại");
      }
    });
  }

  /** Đăng ký các events từ Training Backend */
  private registerTrainingEvents(): void {
    if (!this.socket) return;

    // ---- CRAWL EVENTS ----
    // Log từ quá trình crawl website
    this.socket.on("crawl_log", (data) => this.dispatch("crawl_log", data));
    this.socket.on("crawl_started", (data) => this.dispatch("crawl_started", data));
    
    // Job crawl hoàn thành - trigger refresh buffers
    this.socket.on("job_completed", (data) => {
      console.log("[WS] ✓ Job completed:", data?.job_id?.substring(0, 8));
      this.dispatch("job_completed", data);
    });

    // ---- TRAINING EVENTS ----
    // Trạng thái training job trong queue
    this.socket.on("training_queued", (data) => this.dispatch("training_queued", data));
    this.socket.on("training_started", (data) => this.dispatch("training_started", data));
    this.socket.on("training_completed", (data) => this.dispatch("training_completed", data));
    this.socket.on("training_failed", (data) => this.dispatch("training_failed", data));

    // ---- LEARNING EVENTS ----
    // Cập nhật về RL learning cycles
    this.socket.on("pending_rollouts_updated", (data) => this.dispatch("pending_rollouts_updated", data));
    this.socket.on("learning_cycle_complete", (data) => this.dispatch("learning_cycle_complete", data));

    // ---- BUFFER EVENTS ----
    // Pattern buffer được tạo/sẵn sàng/hủy
    this.socket.on("buffer_created", (data) => this.dispatch("buffer_created", data));
    this.socket.on("buffer_ready", (data) => this.dispatch("buffer_ready", data));
    this.socket.on("buffer_discarded", (data) => this.dispatch("buffer_discarded", data));

    // ---- VERSION EVENTS ----
    // Admin commit training data → tạo version mới
    this.socket.on("version_committed", (data) => this.dispatch("version_committed", data));
    this.socket.on("version_created", (data) => this.dispatch("version_created", data));
    this.socket.on("commit_progress", (data) => this.dispatch("commit_progress", data));

    // ---- QUEUE EVENTS ----
    this.socket.on("queue_updated", (data) => this.dispatch("queue_updated", data));

    // ---- GENERIC MESSAGE ----
    this.socket.on("message", (message: WebSocketMessage) => this.handleMessage(message));
  }

  /** Helper: Dispatch event với type */
  private dispatch(type: WebSocketMessageType, data: any): void {
    this.handleMessage({ type, ...data });
  }

  // ------------------------------------------------------------
  // QUẢN LÝ EVENT HANDLERS
  // ------------------------------------------------------------

  /** Đăng ký handler cho event type cụ thể hoặc "all" */
  on(eventType: WebSocketMessageType | "all", handler: (data: any) => void): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)!.add(handler);
  }

  /** Hủy đăng ký handler */
  off(eventType: WebSocketMessageType | "all", handler: (data: any) => void): void {
    this.messageHandlers.get(eventType)?.delete(handler);
  }

  /** Xử lý message và gọi các handlers đã đăng ký */
  private handleMessage(message: WebSocketMessage): void {
    // Gọi handlers cho event type cụ thể
    this.messageHandlers.get(message.type)?.forEach((handler) => handler(message));
    // Gọi handlers "all" (dùng cho context notifications)
    this.messageHandlers.get("all")?.forEach((handler) => handler(message));
  }

  // ------------------------------------------------------------
  // KẾT NỐI VÀ ROOMS
  // ------------------------------------------------------------

  /** Ngắt kết nối và cleanup */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.messageHandlers.clear();
    this.reconnectAttempts = 0;
  }

  /** Kiểm tra trạng thái kết nối */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /** Tham gia room để nhận events của job/admin cụ thể */
  joinRoom(roomName: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("join_room", roomName);
  }

  /** Rời khỏi room */
  leaveRoom(roomName: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("leave_room", roomName);
  }

  /** Subscribe dashboard updates */
  subscribeDashboard(): void {
    if (!this.socket?.connected) return;
    this.socket.emit("subscribe_dashboard");
  }

  /** Join admin workspace để nhận notifications */
  joinAdminWorkspace(adminId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("join_admin_workspace", adminId);
  }

  /** Join training session room */
  joinTrainingSession(jobId: string): void {
    this.joinRoom(`training_${jobId}`);
  }

  /** Leave training session room */
  leaveTrainingSession(jobId: string): void {
    this.leaveRoom(`training_${jobId}`);
  }

  /** Gửi event qua WebSocket */
  emit(eventName: string, data?: any): void {
    if (!this.socket?.connected) {
      console.error("[WS] Không thể emit: chưa kết nối");
      return;
    }
    this.socket.emit(eventName, data);
  }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const wsService = new WebSocketService();
export default wsService;
