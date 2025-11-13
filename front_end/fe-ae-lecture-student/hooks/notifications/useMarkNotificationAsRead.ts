// hooks/notifications/useMarkNotificationAsRead.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";
import type { ApiSuccess } from "@/types/reports/reports.response";

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
