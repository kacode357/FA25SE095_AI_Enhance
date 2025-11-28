// hooks/announcements/useStudentAnnouncements.ts
"use client";

import { useCallback, useState } from "react";

import { AnnouncementService } from "@/services/announcement.services";
import type {
  GetAnnouncementsQuery,
} from "@/types/announcements/announcement.payload";
import type {
  GetAnnouncementsResponse,
  AnnouncementItem,
} from "@/types/announcements/announcement.response";

type PaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const defaultPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function useStudentAnnouncements() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [pagination, setPagination] =
    useState<PaginationState>(defaultPagination);

  const fetchStudentAnnouncements = useCallback(
    async (
      params?: GetAnnouncementsQuery
    ): Promise<GetAnnouncementsResponse> => {
      setLoading(true);
      try {
        const res = await AnnouncementService.getStudentAnnouncements(params);
        const page = res.data;

        setItems(page.items || []);
        setPagination({
          page: page.page,
          pageSize: page.pageSize,
          totalItems: page.totalItems,
          totalPages: page.totalPages,
          hasPreviousPage: page.page > 1,
          hasNextPage: page.page < page.totalPages,
        });

        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    items,
    pagination,
    fetchStudentAnnouncements,
  };
}
