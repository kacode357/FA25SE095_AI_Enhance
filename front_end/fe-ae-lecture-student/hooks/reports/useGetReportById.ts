"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { GetReportResponse } from "@/types/reports/reports.response";

export function useGetReportById() {
  const [loading, setLoading] = useState(false);

  const getReportById = async (id: string): Promise<GetReportResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getById(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getReportById, loading };
}
