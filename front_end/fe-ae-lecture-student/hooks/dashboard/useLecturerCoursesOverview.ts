"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  LecturerCoursesOverviewResponse,
} from "@/types/dashboard/dashboard.response";

export function useLecturerCoursesOverview() {
  const [data, setData] =
    useState<LecturerCoursesOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCoursesOverview = async (termId?: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getLecturerCoursesOverview(
          termId ? { termId } : undefined
        );
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchCoursesOverview };
}
