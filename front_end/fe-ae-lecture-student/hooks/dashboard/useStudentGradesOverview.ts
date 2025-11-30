"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  StudentGradesOverviewResponse,
} from "@/types/dashboard/dashboard.response";

export function useStudentGradesOverview() {
  const [data, setData] = useState<StudentGradesOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOverview = async (termId?: string) => {
    setLoading(true);
    try {
      const res = await DashboardService.getStudentGradesOverview(
        termId ? { termId } : undefined
      );
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchOverview };
}
