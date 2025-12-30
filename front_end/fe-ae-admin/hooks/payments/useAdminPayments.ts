// hooks/payments/useAdminPayments.ts
"use client";

import { useCallback, useState } from "react";

import { PaymentService } from "@/services/payment.services";
import type { AdminPaymentsQuery } from "@/types/payments/payment.payload";
import type {
  AdminPaymentItem,
  GetAdminPaymentsResponse,
} from "@/types/payments/payment.response";

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

export function useAdminPayments() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminPaymentItem[]>([]);
  const [pagination, setPagination] =
    useState<PaginationState>(defaultPagination);

  const fetchAdminPayments = useCallback(
    async (params?: AdminPaymentsQuery): Promise<GetAdminPaymentsResponse> => {
      setLoading(true);
      try {
        const res = await PaymentService.getAdminPayments(params);
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
    fetchAdminPayments,
  };
}
