// hooks/notifications/useDeleteNotification.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";
import type { ApiSuccess } from "@/types/reports/reports.response";

export function useDeleteNotification() {
  const [loading, setLoading] = useState(false);

  const deleteNotification = async (id: string): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await NotificationsService.delete(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { deleteNotification, loading };
}
