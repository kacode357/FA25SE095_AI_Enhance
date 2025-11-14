"use client";

import { ReportsService } from "@/services/reports.services";
import type { GetLateSubmissionsQuery } from "@/types/reports/reports.payload";
import type { GetLateSubmissionsResponse } from "@/types/reports/reports.response";
import { useState } from "react";

export function useGetLateSubmissions() {
  const [loading, setLoading] = useState(false);

  const getLateSubmissions = async (
    params?: GetLateSubmissionsQuery
  ): Promise<GetLateSubmissionsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getLateSubmissions(params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getLateSubmissions, loading };
}
