"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { ApiSuccess } from "@/types/reports/reports.response";

export function useDeleteReport() {
  const [loading, setLoading] = useState(false);

  const deleteReport = async (id: string): Promise<ApiSuccess | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.delete(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { deleteReport, loading };
}
