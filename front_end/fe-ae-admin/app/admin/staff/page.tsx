"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Components
import PaginationBar from "@/components/common/pagination-all";
import UserFilters from "../lecturers/components/UserFilters"; // Hoặc đường dẫn component filter của mày
import UserTable from "./components/UserTable"; // Dùng Table riêng của Student (có ActionMenu mới)

// Hooks & Types
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import {
  AdminUserRoleFilter,
  type AdminUsersQuery,
} from "@/types/admin/admin-user.payload";
import type { AdminUserItem } from "@/types/admin/admin-user.response";

const PAGE_SIZE = 8;

type UserFiltersState = {
  searchTerm?: string;
  sortBy?: AdminUsersQuery["sortBy"];
  sortOrder?: AdminUsersQuery["sortOrder"];
};

export default function AdminStudentsPage() {
  // 1. Hook API
  const { loading, items, pagination, fetchAdminUsers } = useAdminUsers();
  
  // 2. State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFiltersState>({
    sortBy: "CreatedAt",
    sortOrder: "Desc",
  });

  // 3. Query Params - Hardcode Role Student
  const queryParams: AdminUsersQuery = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      role: AdminUserRoleFilter.Staff, 
      searchTerm: filters.searchTerm,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [page, filters]
  );

  // 4. Fetch data
  useEffect(() => {
    fetchAdminUsers(queryParams);
  }, [fetchAdminUsers, queryParams]);

  // 5. Hàm Refresh (Dùng useCallback để truyền xuống ActionMenu không bị re-render)
  const handleRefresh = useCallback(() => {
    fetchAdminUsers(queryParams);
  }, [fetchAdminUsers, queryParams]);

  // 6. Handlers UI
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
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header / Breadcrumb Area */}
      <div className="flex flex-col gap-2 px-4 pt-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lecturers Management</h1>
          <p className="text-sm text-slate-500">
            View, search and manage all lecturer accounts.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 px-4 pb-10">
        <UserFilters
          loading={loading}
          filters={filters}
          onChange={handleFiltersChange}
        />
        
        {/* Truyền hàm handleRefresh xuống Table -> ActionMenu */}
        <UserTable 
          loading={loading} 
          items={items as AdminUserItem[]} 
          onRefresh={handleRefresh}
        />
        
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