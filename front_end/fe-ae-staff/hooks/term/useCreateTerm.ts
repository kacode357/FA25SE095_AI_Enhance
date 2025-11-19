// hooks/term/useCreateTerm.ts
"use client";

import { TermService } from "@/services/terms.services";
import { CreateTermPayload } from "@/types/terms/terms.payload";
import { CreateTermResponse } from "@/types/terms/terms.response";
import { useState } from "react";
import { toast } from "sonner";

export function useCreateTerm() {
  const [loading, setLoading] = useState(false);

  const createTerm = async (
    payload: CreateTermPayload
  ): Promise<CreateTermResponse | null> => {
    setLoading(true);
    try {
      const res = await TermService.create(payload);
      toast.success(res.message || "Term created successfully.");
      return res;
    } catch {
      // lỗi đã có interceptor xử lý
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createTerm, loading };
}
