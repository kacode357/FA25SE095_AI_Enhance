// hooks/term/useTerms.ts
"use client";

import { useState, useCallback } from "react";
import { TermService } from "@/services/terms.services";
import { GetTermsQuery } from "@/types/terms/terms.payload";
import { Term, GetTermsResponse } from "@/types/terms/terms.response";

export function useTerms() {
  const [listData, setListData] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerms = useCallback(async (params?: GetTermsQuery) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res: GetTermsResponse = await TermService.getAll(params);
      setListData(res.terms || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch terms");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return {
    listData,
    loading,
    error,
    fetchTerms,
  };
}
