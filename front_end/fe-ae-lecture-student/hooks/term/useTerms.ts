// hooks/term/useTerms.ts
"use client";

import { useCallback, useState } from "react";
import { TermService } from "@/services/term.services";
import { TermResponse } from "@/types/term/term.response";

export function useTerms() {
  const [data, setData] = useState<TermResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Sửa ở đây: thay [loading] thành []
  const fetchTerms = useCallback(async () => {
    if (loading) return null; // tránh spam thêm 1 lớp
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
  }, []); // <--- LỖI LÀ Ở ĐÂY, SỬA THÀNH []

  return { data, loading, error, fetchTerms };
}