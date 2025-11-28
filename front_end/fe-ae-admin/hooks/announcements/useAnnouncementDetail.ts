// hooks/announcements/useAnnouncementDetail.ts
"use client";

import { useCallback, useState } from "react";

import { AnnouncementService } from "@/services/announcement.services";
import type {
  AnnouncementItem,
  GetAnnouncementByIdResponse,
} from "@/types/announcements/announcement.response";

export function useAnnouncementDetail() {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] =
    useState<AnnouncementItem | null>(null);

  const fetchAnnouncement = useCallback(
    async (id: string): Promise<GetAnnouncementByIdResponse> => {
      setLoading(true);
      try {
        const res = await AnnouncementService.getAnnouncementById(id);
        setAnnouncement(res.data);
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    announcement,
    fetchAnnouncement,
  };
}
