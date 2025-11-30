"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  LecturerAssignmentsStatisticsResponse,
} from "@/types/dashboard/dashboard.response";

export function useLecturerAssignmentsStatistics() {
  const [data, setData] =
    useState<LecturerAssignmentsStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignmentsStatistics = async (courseId: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getLecturerAssignmentsStatistics(courseId);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchAssignmentsStatistics };
}
