// hooks/admin/usePendingApprovalUsers.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type {
  AdminUserItem,
  GetPendingApprovalUsersResponse,
} from "@/types/admin/admin-user.response";

type PendingPaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const defaultPagination: PendingPaginationState = {
  page: 1,
  pageSize: 100,
  totalItems: 0,
  totalPages: 0,
};

export function usePendingApprovalUsers() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] =
    useState<PendingPaginationState>(defaultPagination);

  const fetchPendingApprovalUsers = useCallback(
    async (): Promise<GetPendingApprovalUsersResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.getPendingApprovalUsers();
        const page = res.data;

        setItems(page.users || []);
        setPagination({
          page: page.page,
          pageSize: page.pageSize,
          totalItems: page.totalCount,
          totalPages: page.totalPages,
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
    fetchPendingApprovalUsers,
  };
}
