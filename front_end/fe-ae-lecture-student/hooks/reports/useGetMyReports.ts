"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { MyReportsQuery } from "@/types/reports/reports.payload";
import type { MyReportsResponse } from "@/types/reports/reports.response";

export function useGetMyReports() {
  const [loading, setLoading] = useState(false);

  const getMyReports = async (
    query?: MyReportsQuery
  ): Promise<MyReportsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getMyReports(query);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getMyReports, loading };
}
