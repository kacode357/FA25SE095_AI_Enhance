// hooks/term/useUpdateTerm.ts
"use client";

import { TermService } from "@/services/terms.services";
import { UpdateTermPayload } from "@/types/terms/terms.payload";
import { UpdateTermResponse } from "@/types/terms/terms.response";
import { useState } from "react";

export function useUpdateTerm() {
  const [loading, setLoading] = useState(false);

  const updateTerm = async (
    id: string,
    payload: UpdateTermPayload
  ): Promise<UpdateTermResponse | null> => {
    setLoading(true);
    try {
      const res = await TermService.update(id, payload);
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateTerm, loading };
}
