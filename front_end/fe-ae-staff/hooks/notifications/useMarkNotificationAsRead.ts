// hooks/notifications/useMarkNotificationAsRead.ts
"use client";

import { ApiSuccess, NotificationsService } from "@/services/notifications.services";
import { useState } from "react";

export function useMarkNotificationAsRead() {
  const [loading, setLoading] = useState(false);

  const markNotificationAsRead = async (
    id: string
  ): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await NotificationsService.markAsRead(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { markNotificationAsRead, loading };
}
