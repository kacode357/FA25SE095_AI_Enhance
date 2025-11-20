// hooks/notifications/useMarkAllNotificationsAsRead.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";
import type { ApiSuccess } from "@/types/reports/reports.response";

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
