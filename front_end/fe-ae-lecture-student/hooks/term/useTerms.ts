// hooks/term/useTerms.ts
"use client";

import { TermService } from "@/services/term.services";
import { TermResponse } from '@/types/term/term.response';
import { useCallback, useState } from "react";

export function useTerms() {
  const [data, setData] = useState<TermResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Không cần bắt lỗi nữa, interceptor đã xử lý toast
  const fetchTerms = useCallback(async () => {
    if (loading) return null; // tránh spam gọi liên tục
    setLoading(true);
    try {
      const res = await TermService.getAll();
      setData(res.terms || []);
      return res;
    } finally {
      setLoading(false);
    }
  }, []); // giữ [] như mày đang để

  return { data, loading, fetchTerms };
}
