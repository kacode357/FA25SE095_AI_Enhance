// hooks/announcements/useCreateAnnouncement.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AnnouncementService } from "@/services/announcement.services";
import type {
  CreateAnnouncementPayload,
} from "@/types/announcements/announcement.payload";
import type {
  CreateAnnouncementResponse,
} from "@/types/announcements/announcement.response";

export function useCreateAnnouncement() {
  const [loading, setLoading] = useState(false);

  const createAnnouncement = useCallback(
    async (
      payload: CreateAnnouncementPayload
    ): Promise<CreateAnnouncementResponse> => {
      setLoading(true);
      try {
        const res = await AnnouncementService.createAnnouncement(payload);

        // ✅ only show success toast
        toast.success(res.message || "Announcement created successfully.");

        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createAnnouncement,
    loading,
  };
}
