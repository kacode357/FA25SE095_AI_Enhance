"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import PaginationBar from "@/components/common/pagination-all";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import {
  AdminUserRoleFilter,
  type AdminUsersQuery,
} from "@/types/admin/admin-user.payload";
import type { AdminUserItem } from "@/types/admin/admin-user.response";

import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";

const PAGE_SIZE = 8;

// Rút gọn state, bỏ role, status, tier
type UserFiltersState = {
  searchTerm?: string;
  sortBy?: AdminUsersQuery["sortBy"];
  sortOrder?: AdminUsersQuery["sortOrder"];
};

export default function AdminAllUsersPage() {
  const { loading, items, pagination, fetchAdminUsers } = useAdminUsers();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFiltersState>({
    sortBy: "CreatedAt",
    sortOrder: "Desc",
  });

  const queryParams: AdminUsersQuery = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      // QUAN TRỌNG: Hardcode Role là Student ở đây
      role: AdminUserRoleFilter.Staff,
      searchTerm: filters.searchTerm,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [page, filters]
  );

  useEffect(() => {
    fetchAdminUsers(queryParams);
  }, [fetchAdminUsers, queryParams]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage !== page) {
      setPage(nextPage);
    }
  };

  const handleFiltersChange = (patch: Partial<UserFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-2 px-4 pt-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staffs Management</h1>
          <p className="text-sm text-slate-500">
            View, search and manage all staff accounts.
          </p>
        </div>
      </div>
      <div>
        <div className="space-y-4 p-4">
          <UserFilters
            loading={loading}
            filters={filters}
            onChange={handleFiltersChange}
          />
          <UserTable loading={loading} items={items as AdminUserItem[]} />
        </div>

        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalItems}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>
    </motion.div>
  );
}