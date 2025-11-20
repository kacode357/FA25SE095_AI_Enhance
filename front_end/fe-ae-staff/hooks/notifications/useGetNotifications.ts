// hooks/notifications/useGetNotifications.ts
"use client";

import { useState } from "react";
import { NotificationsService } from "@/services/notifications.services";
import type { NotificationListQuery } from "@/types/notifications/notifications.payload";
import type { NotificationsListResponse } from "@/types/notifications/notifications.response";

export function useGetNotifications() {
  const [loading, setLoading] = useState(false);

  const getNotifications = async (
    query?: NotificationListQuery
  ): Promise<NotificationsListResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await NotificationsService.getList(query);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getNotifications, loading };
}
