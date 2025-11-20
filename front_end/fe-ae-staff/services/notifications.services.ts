// services/notifications.services.ts
import { notificationAxiosInstance as api } from "@/config/axios.config";
import type {
  CreateNotificationPayload,
  NotificationListQuery,
} from "@/types/notifications/notifications.payload";
import type {
  NotificationItem,
  NotificationsListResponse,
  UnreadCountResponse,
} from "@/types/notifications/notifications.response";

export interface ApiSuccess {
  success: boolean;
  message: string;
}

export const NotificationsService = {
  /** ✅ GET /api/Notifications — list notifications (optional filter isRead, take) */
  getList: async (
    query?: NotificationListQuery
  ): Promise<NotificationsListResponse> => {
    const res = await api.get<NotificationsListResponse>("/Notifications", {
      params: query,
    });
    return res.data;
  },

  /** ✅ GET /api/Notifications/{id} — get by id */
  getById: async (id: string): Promise<NotificationItem> => {
    const res = await api.get<NotificationItem>(`/Notifications/${id}`);
    return res.data;
  },

  /** ✅ POST /api/Notifications — create notification (system side) */
  create: async (
    payload: CreateNotificationPayload
  ): Promise<NotificationItem> => {
    const res = await api.post<NotificationItem>("/Notifications", payload);
    return res.data;
  },

  /** ✅ DELETE /api/Notifications/{id} — delete notification */
  delete: async (id: string): Promise<ApiSuccess> => {
    const res = await api.delete<ApiSuccess>(`/Notifications/${id}`);
    return res.data;
  },

  /** ✅ GET /api/Notifications/unread-count — unread notifications count */
  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<UnreadCountResponse>("/Notifications/unread-count");
    // fallback 0 cho chắc nếu BE không trả field
    return res.data?.unreadCount ?? 0;
  },

  /** ✅ PUT /api/Notifications/{id}/mark-as-read — mark single as read */
  markAsRead: async (id: string): Promise<ApiSuccess> => {
    const res = await api.put<ApiSuccess>(`/Notifications/${id}/mark-as-read`);
    return res.data;
  },

  /** ✅ PUT /api/Notifications/mark-all-as-read — mark all as read */
  markAllAsRead: async (): Promise<ApiSuccess> => {
    const res = await api.put<ApiSuccess>("/Notifications/mark-all-as-read");
    return res.data;
  },
};
