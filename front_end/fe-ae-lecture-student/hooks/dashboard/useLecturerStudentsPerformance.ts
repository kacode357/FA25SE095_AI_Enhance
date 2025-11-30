"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  LecturerStudentsPerformanceResponse,
} from "@/types/dashboard/dashboard.response";

export function useLecturerStudentsPerformance() {
  const [data, setData] =
    useState<LecturerStudentsPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStudentsPerformance = async (courseId: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getLecturerStudentsPerformance(courseId);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchStudentsPerformance };
}
