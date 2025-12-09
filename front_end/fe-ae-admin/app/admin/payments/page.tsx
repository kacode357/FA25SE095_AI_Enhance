"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Components
import PaginationBar from "@/components/common/pagination-all";
import PaymentFilters, { PaymentFiltersState } from "./components/PaymentFilters";
import PaymentTable from "./components/PaymentTable";

// Hooks & Types
import { useAdminSubscriptionPayments } from "@/hooks/payments/useAdminPayments";
import type { AdminSubscriptionPaymentsQuery } from "@/types/payments/payment.payload";
import type { SubscriptionTier } from "@/types/subscription/subscription.response";

const PAGE_SIZE = 20;

export default function AdminSubscriptionPaymentsPage() {
  // 1. Hook
  const { loading, items, pagination, fetchAdminSubscriptionPayments } = useAdminSubscriptionPayments();

  // 2. Local State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PaymentFiltersState>({});

  // 3. Build Query Params
  const queryParams: AdminSubscriptionPaymentsQuery = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      userId: filters.searchTerm, // Backend của mày dùng userId để search? Nếu search cả orderCode thì cần check lại BE
      status: filters.status ? Number(filters.status) : undefined, // Convert string -> enum number
    tier: filters.tier as unknown as SubscriptionTier,
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    [page, filters]
  );

  // 4. Fetch Data
  useEffect(() => {
    fetchAdminSubscriptionPayments(queryParams);
  }, [fetchAdminSubscriptionPayments, queryParams]);

  // 5. Handlers
  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleFiltersChange = (patch: Partial<PaymentFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1); // Reset về trang 1 khi filter
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 px-4 pt-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Payments</h1>
          <p className="text-sm text-slate-500">
            View and manage all subscription transactions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 px-4 pb-10">
        <PaymentFilters
          loading={loading}
          filters={filters}
          onChange={handleFiltersChange}
        />

        <PaymentTable 
          loading={loading} 
          items={items} 
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