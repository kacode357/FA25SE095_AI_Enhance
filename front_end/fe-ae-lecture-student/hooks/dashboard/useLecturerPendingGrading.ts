"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  LecturerPendingGradingResponse,
} from "@/types/dashboard/dashboard.response";

export function useLecturerPendingGrading() {
  const [data, setData] =
    useState<LecturerPendingGradingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPendingGrading = async (courseId?: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getLecturerPendingGrading(
          courseId ? { courseId } : undefined
        );
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchPendingGrading };
}
