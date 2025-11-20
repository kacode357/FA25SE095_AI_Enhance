// hooks/support-requests/useMySupportRequests.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { GetMySupportRequestsQuery } from "@/types/support/support-request.payload";
import type {
  GetMySupportRequestsResponse,
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

export function useMySupportRequests() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SupportRequestItem[]>([]);
  const [pagination, setPagination] =
    useState<PaginationState>(defaultPagination);

  const fetchMySupportRequests = useCallback(
    async (
      params?: GetMySupportRequestsQuery
    ): Promise<GetMySupportRequestsResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.getMySupportRequests(params);
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
    fetchMySupportRequests,
  };
}
