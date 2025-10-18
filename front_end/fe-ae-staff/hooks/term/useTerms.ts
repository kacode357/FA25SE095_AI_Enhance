// hooks/term/useTerms.ts
"use client";

import { useState, useCallback } from "react";
import { TermService } from "@/services/terms.services";
import { GetTermsQuery } from "@/types/terms/terms.payload";
import { Term, GetTermsResponse } from "@/types/terms/terms.response";

export function useTerms() {
  const [listData, setListData] = useState<Term[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all terms with optional filters & pagination
   */
  const fetchTerms = useCallback(
    async (params?: GetTermsQuery) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const res: GetTermsResponse = await TermService.getAll(params);

        // ✅ Cập nhật danh sách & phân trang
        setListData(res.terms || []);
        setTotalCount(res.totalCount || 0);
        setPage(res.page || 1);
        setPageSize(res.pageSize || 10);
        setTotalPages(res.totalPages || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch terms");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return {
    listData,
    totalCount,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    fetchTerms,
  };
}
