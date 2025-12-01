// hooks/admin/useAdminUsers.ts
"use client";

import { useCallback, useState } from "react";

import { AdminUserService } from "@/services/admin-user.services";
import type { AdminUsersQuery } from "@/types/admin/admin-user.payload";
import type {
  AdminUserItem,
  GetAdminUsersResponse,
} from "@/types/admin/admin-user.response";

type AdminUsersPaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const defaultPagination: AdminUsersPaginationState = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function useAdminUsers() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] =
    useState<AdminUsersPaginationState>(defaultPagination);

  const fetchAdminUsers = useCallback(
    async (params?: AdminUsersQuery): Promise<GetAdminUsersResponse> => {
      setLoading(true);
      try {
        const res = await AdminUserService.getAdminUsers(params);
        const page = res.data;

        setItems(page.users || []);
        setPagination({
          page: page.page,
          pageSize: page.pageSize,
          totalItems: page.totalCount,
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
    fetchAdminUsers,
  };
}
