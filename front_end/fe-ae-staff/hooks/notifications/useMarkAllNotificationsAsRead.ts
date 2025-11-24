// hooks/notifications/useMarkAllNotificationsAsRead.ts
"use client";

import { ApiSuccess, NotificationsService } from "@/services/notifications.services";
import { useState } from "react";

export function useMarkAllNotificationsAsRead() {
  const [loading, setLoading] = useState(false);

  const markAllNotificationsAsRead = async (): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await NotificationsService.markAllAsRead();
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { markAllNotificationsAsRead, loading };
}
