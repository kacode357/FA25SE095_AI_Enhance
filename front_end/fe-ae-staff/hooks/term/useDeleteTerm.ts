// hooks/term/useDeleteTerm.ts
"use client";

import { TermService } from "@/services/terms.services";
import { DeleteTermResponse } from "@/types/terms/terms.response";
import { useState } from "react";

export function useDeleteTerm() {
  const [loading, setLoading] = useState(false);

  const deleteTerm = async (id: string): Promise<DeleteTermResponse | null> => {
    setLoading(true);
    try {
      const res = await TermService.delete(id);
      // Let backend/interceptor handle success/error toasts.
      return res;
    } catch (err: any) {
      // Errors are handled by global interceptor; return null for caller to handle.
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTerm, loading };
}
