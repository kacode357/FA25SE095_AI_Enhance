// hooks/notifications/useGetNotificationById.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";
import type { NotificationItem } from "@/types/notifications/notifications.response";

export function useGetNotificationById() {
  const [loading, setLoading] = useState(false);

  const getNotificationById = async (
    id: string
  ): Promise<NotificationItem | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await NotificationsService.getById(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getNotificationById, loading };
}
