"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  StudentGradeBreakdownResponse,
} from "@/types/dashboard/dashboard.response";

export function useStudentGradeBreakdown() {
  const [data, setData] = useState<StudentGradeBreakdownResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGradeBreakdown = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await DashboardService.getStudentGradeBreakdown(courseId);
      setData(res);
      return res;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch grade breakdown";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchGradeBreakdown };
}
