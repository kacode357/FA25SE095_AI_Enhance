"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Components
import PaginationBar from "@/components/common/pagination-all";
import PaymentFilters, { PaymentFiltersState } from "./components/PaymentFilters";
import PaymentTable from "./components/PaymentTable";

// Hooks & Types
import { useAdminPayments } from "@/hooks/payments/useAdminPayments";
import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import type { AdminPaymentsQuery } from "@/types/payments/payment.payload";

const PAGE_SIZE = 20;

export default function AdminPaymentsPage() {
  // 1. Hook
  const { loading, items, pagination, fetchAdminPayments } = useAdminPayments();
  const { loading: tiersLoading, tiers, fetchSubscriptionTiers } =
    useSubscriptionTiers();

  // 2. Local State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PaymentFiltersState>({});

  // 3. Build Query Params
  const queryParams: AdminPaymentsQuery = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      userId: filters.searchTerm,
      status: filters.status ? Number(filters.status) : undefined,
      tierId: filters.tierId,
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    [page, filters]
  );

  const tierOptions = useMemo(
    () =>
      tiers.map((tier) => ({
        value: tier.id,
        label: Number.isFinite(tier.level)
          ? `${tier.name} (L${tier.level})`
          : tier.name,
      })),
    [tiers]
  );

  // 4. Fetch Data
  useEffect(() => {
    fetchAdminPayments(queryParams);
  }, [fetchAdminPayments, queryParams]);

  useEffect(() => {
    fetchSubscriptionTiers({ isActive: true });
  }, [fetchSubscriptionTiers]);

  // 5. Handlers
  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleFiltersChange = (patch: Partial<PaymentFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1); // Reset to page 1 when filters change.
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
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">
            Track and manage all payment transactions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 px-4 pb-10">
        <PaymentFilters
          loading={loading || tiersLoading}
          filters={filters}
          tierOptions={tierOptions}
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
