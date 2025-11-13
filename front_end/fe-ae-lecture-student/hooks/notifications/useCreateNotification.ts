// hooks/notifications/useCreateNotification.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";
import type { CreateNotificationPayload } from "@/types/notifications/notifications.payload";
import type { NotificationItem } from "@/types/notifications/notifications.response";

export function useCreateNotification() {
  const [loading, setLoading] = useState(false);

  const createNotification = async (
    payload: CreateNotificationPayload
  ): Promise<NotificationItem | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await NotificationsService.create(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { createNotification, loading };
}
