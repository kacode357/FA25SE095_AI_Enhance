export interface NotificationListQuery {
  isRead?: boolean;
  take?: number;
}

export interface CreateNotificationPayload {
  userId: string;
  title: string;
  content: string;
  type: number;
  priority: number;
  source: number;
  relatedEntityId?: string | null;
  metadataJson?: string | null;
  expiresAt?: string | null;
  channels?: number[];
}
