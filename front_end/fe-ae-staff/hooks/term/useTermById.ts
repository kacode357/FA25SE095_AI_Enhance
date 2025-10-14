// hooks/term/useTermById.ts
"use client";

import { useState, useCallback } from "react";
import { TermService } from "@/services/terms.services";
import { Term, GetTermByIdResponse } from "@/types/terms/terms.response";

export function useTermById() {
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTermById = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res: GetTermByIdResponse = await TermService.getById(id);
      setTerm(res.term);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch term");
      setTerm(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    term,
    loading,
    error,
    fetchTermById,
  };
}
