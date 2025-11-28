// hooks/announcements/useUpdateAnnouncement.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AnnouncementService } from "@/services/announcement.services";
import type {
  UpdateAnnouncementPayload,
} from "@/types/announcements/announcement.payload";
import type {
  UpdateAnnouncementResponse,
} from "@/types/announcements/announcement.response";

export function useUpdateAnnouncement() {
  const [loading, setLoading] = useState(false);

  const updateAnnouncement = useCallback(
    async (
      id: string,
      payload: UpdateAnnouncementPayload
    ): Promise<UpdateAnnouncementResponse> => {
      setLoading(true);
      try {
        const res = await AnnouncementService.updateAnnouncement(id, payload);

        // ✅ only show success toast
        toast.success(res.message || "Announcement updated successfully.");

        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    updateAnnouncement,
  };
}
