// types/notifications/notifications.response.ts

/** =======================
 *  Response DTOs
 *  ======================= */

/**
 * Item notification như BE trả từ GET /api/Notifications
 */
export interface NotificationItem {
  id: string;

  userId: string;
  relatedEntityId: string | null;

  title: string;
  content: string;

  type: number;
  priority: number;
  source: number;

  isRead: boolean;
  /** ISO datetime hoặc null */
  readAt: string | null;

  /** ISO datetime hoặc null */
  expiresAt: string | null;

  /** JSON string – parse client side nếu cần */
  metadataJson: string | null;

  isDeleted: boolean;
  /** ISO datetime hoặc null */
  deletedAt: string | null;

  /** Hệ thống log – không dùng tới thì để unknown[] */
  deliveryLogs: unknown[];

  createdBy: string | null;
  updatedBy: string | null;

  /** ISO datetime */
  createdAt: string;
  /** ISO datetime hoặc null */
  updatedAt: string | null;

  /** Domain events từ BE – không dùng thì để unknown[] */
  domainEvents: unknown[];
}

/** GET /api/Notifications -> array NotificationItem */
export type NotificationsListResponse = NotificationItem[];

/** GET /api/Notifications/unread-count */
export interface UnreadCountResponse {
  /** số notification chưa đọc */
  unreadCount: number;
}
    