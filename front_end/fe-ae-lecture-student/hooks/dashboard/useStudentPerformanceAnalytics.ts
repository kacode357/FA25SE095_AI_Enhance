"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  StudentPerformanceAnalyticsResponse,
} from "@/types/dashboard/dashboard.response";

export function useStudentPerformanceAnalytics() {
  const [data, setData] =
    useState<StudentPerformanceAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (termId?: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getStudentPerformanceAnalytics(
          termId ? { termId } : undefined
        );
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchAnalytics };
}
