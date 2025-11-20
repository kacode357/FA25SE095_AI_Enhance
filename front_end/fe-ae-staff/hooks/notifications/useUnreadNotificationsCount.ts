// hooks/notifications/useUnreadNotificationsCount.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";

export function useUnreadNotificationsCount() {
  const [loading, setLoading] = useState(false);

  const getUnreadNotificationsCount = async (): Promise<number | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const count = await NotificationsService.getUnreadCount();
      return count;
    } finally {
      setLoading(false);
    }
  };

  return { getUnreadNotificationsCount, loading };
}
