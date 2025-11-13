// types/notifications/notifications.payload.ts

/** =======================
 *  Request payloads & queries
 *  ======================= */

/** GET /api/Notifications */
export interface NotificationListQuery {
  /** Filter theo trạng thái đã đọc hay chưa */
  isRead?: boolean;
  /** Số bản ghi muốn lấy, BE sample default ~50 */
  take?: number;
}

/** POST /api/Notifications */
export interface CreateNotificationPayload {
  userId: string;             // target user
  title: string;
  content: string;

  /** numeric enums từ BE (cứ để number, sau này sync enum sau) */
  type: number;
  priority: number;
  source: number;

  relatedEntityId?: string | null;
  /** JSON string – BE đang trả metadataJson là string */
  metadataJson?: string | null;

  /** ISO datetime string hoặc null */
  expiresAt?: string | null;

  /** Channel enum từ BE, để number cho linh hoạt */
  channels?: number[];
}
