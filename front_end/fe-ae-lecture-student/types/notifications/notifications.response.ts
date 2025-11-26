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
  readAt: string | null;
  expiresAt: string | null;
  metadataJson: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deliveryLogs: unknown[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  domainEvents: unknown[];
}

export type NotificationsListResponse = NotificationItem[];

export interface UnreadCountResponse {
  unreadCount: number;
}
