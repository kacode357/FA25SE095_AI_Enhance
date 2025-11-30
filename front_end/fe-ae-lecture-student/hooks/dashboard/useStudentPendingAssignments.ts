"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  StudentPendingAssignmentsResponse,
} from "@/types/dashboard/dashboard.response";

export function useStudentPendingAssignments() {
  const [data, setData] =
    useState<StudentPendingAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPendingAssignments = async () => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getStudentPendingAssignments();
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchPendingAssignments };
}
