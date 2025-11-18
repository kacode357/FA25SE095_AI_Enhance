// hooks/support-requests/useAssignedSupportRequests.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type {
  GetAssignedSupportRequestsQuery,
} from "@/types/support/support-request.payload";
import type {
  GetAssignedSupportRequestsResponse,
  SupportRequestItem,
} from "@/types/support/support-request.response";

type PaginationState = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const defaultPagination: PaginationState = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function useAssignedSupportRequests() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SupportRequestItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);

  const fetchAssignedSupportRequests = useCallback(
    async (params?: GetAssignedSupportRequestsQuery): Promise<GetAssignedSupportRequestsResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.getAssignedSupportRequests(params);
        const page = res.data;

        setItems(page.data || []);
        setPagination({
          totalCount: page.totalCount,
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          totalPages: page.totalPages,
          hasPreviousPage: page.hasPreviousPage,
          hasNextPage: page.hasNextPage,
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
    fetchAssignedSupportRequests,
  };
}
