// app\admin\lecturers\pending-approval\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import PaginationBar from "@/components/common/pagination-all";
import { usePendingApprovalUsers } from "@/hooks/admin/usePendingApprovalUsers";
import {
  AdminUserRoleFilter,
  AdminSubscriptionTierFilter,
} from "@/types/admin/admin-user.payload";
import type { AdminUserItem } from "@/types/admin/admin-user.response";

import PendingFilters from "./components/PendingFilters";
import PendingTable from "./components/PendingTable";

const PAGE_SIZE = 8;

type PendingFiltersState = {
  searchTerm?: string;
  role?: AdminUserRoleFilter;
  subscriptionTier?: AdminSubscriptionTierFilter;
};

export default function PendingApprovalUsersPage() {
  const { loading, items, fetchPendingApprovalUsers } = usePendingApprovalUsers();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PendingFiltersState>({});

  // fetch 1 lần khi mount
  useEffect(() => {
    fetchPendingApprovalUsers();
  }, [fetchPendingApprovalUsers]);

  // filter client-side theo search, role, tier
  const filteredItems = useMemo(() => {
    let data = items as AdminUserItem[];

    if (filters.searchTerm && filters.searchTerm.trim()) {
      const q = filters.searchTerm.trim().toLowerCase();
      data = data.filter((u) => {
        const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
        return (
          u.email.toLowerCase().includes(q) ||
          fullName.toLowerCase().includes(q)
        );
      });
    }

    if (typeof filters.role === "number") {
      data = data.filter((u) => {
        switch (filters.role) {
          case AdminUserRoleFilter.Student:
            return u.role === "Student";
          case AdminUserRoleFilter.Lecturer:
            return u.role === "Lecturer";
          case AdminUserRoleFilter.Staff:
            return u.role === "Staff";
          case AdminUserRoleFilter.Admin:
            return u.role === "Admin";
          case AdminUserRoleFilter.PaidUser:
            return u.role === "PaidUser";
          default:
            return true;
        }
      });
    }

    if (typeof filters.subscriptionTier === "number") {
      data = data.filter((u) => {
        switch (filters.subscriptionTier) {
          case AdminSubscriptionTierFilter.Free:
            return u.subscriptionTier === "Free";
          case AdminSubscriptionTierFilter.Basic:
            return u.subscriptionTier === "Basic";
          case AdminSubscriptionTierFilter.Premium:
            return u.subscriptionTier === "Premium";
          case AdminSubscriptionTierFilter.Enterprise:
            return u.subscriptionTier === "Enterprise";
          default:
            return true;
        }
      });
    }

    return data;
  }, [items, filters]);

  // paginate client-side
  const totalCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredItems.slice(start, end);
  }, [filteredItems, page]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage !== page) {
      setPage(nextPage);
    }
  };

  const handleFiltersChange = (patch: Partial<PendingFiltersState>) => {
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
      
      <div>
        <div className="space-y-4 p-4">
          <PendingFilters
            loading={loading}
            filters={filters}
            onChange={handleFiltersChange}
          />
          <PendingTable loading={loading} items={pagedItems} />
        </div>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>
    </motion.div>
  );
}
