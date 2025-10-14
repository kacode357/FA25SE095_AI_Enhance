"use client";

import { TermService } from "@/services/term.services";
import { TermResponse } from "@/types/term/term.response";
import { useState } from "react";

export function useTerms() {
  const [data, setData] = useState<TermResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await TermService.getAll();
      setData(res.terms);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load terms");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchTerms };
}
