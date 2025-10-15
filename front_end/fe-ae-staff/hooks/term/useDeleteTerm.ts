// hooks/term/useDeleteTerm.ts
"use client";

import { useState } from "react";
import { TermService } from "@/services/terms.services";
import { DeleteTermResponse } from "@/types/terms/terms.response";
import { toast } from "sonner";

export function useDeleteTerm() {
  const [loading, setLoading] = useState(false);

  const deleteTerm = async (id: string): Promise<DeleteTermResponse | null> => {
    setLoading(true);
    try {
      const res = await TermService.delete(id);
      toast.success(res.message || "Xoá term thành công");
      return res;
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete term");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTerm, loading };
}
