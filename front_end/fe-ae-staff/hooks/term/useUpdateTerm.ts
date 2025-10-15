// hooks/term/useUpdateTerm.ts
"use client";

import { useState } from "react";
import { TermService } from "@/services/terms.services";
import { UpdateTermPayload } from "@/types/terms/terms.payload";
import { UpdateTermResponse } from "@/types/terms/terms.response";
import { toast } from "sonner";

export function useUpdateTerm() {
  const [loading, setLoading] = useState(false);

  const updateTerm = async (
    id: string,
    payload: UpdateTermPayload
  ): Promise<UpdateTermResponse | null> => {
    setLoading(true);
    try {
      const res = await TermService.update(id, payload);
      toast.success(res.message || "Cập nhật term thành công");
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateTerm, loading };
}
