"use client";

import { ReportsService } from "@/services/reports.services";
import type { GetReportsRequiringGradingQuery } from "@/types/reports/reports.payload";
import type { GetReportsRequiringGradingResponse } from "@/types/reports/reports.response";
import { useState } from "react";

export function useGetReportsRequiringGrading() {
  const [loading, setLoading] = useState(false);

  const getReportsRequiringGrading = async (
    params?: GetReportsRequiringGradingQuery
  ): Promise<GetReportsRequiringGradingResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getRequiringGrading(params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getReportsRequiringGrading, loading };
}
