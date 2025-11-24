// hooks/notifications/useDeleteNotification.ts
"use client";

import { ApiSuccess, NotificationsService } from "@/services/notifications.services";
import { useState } from "react";

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
