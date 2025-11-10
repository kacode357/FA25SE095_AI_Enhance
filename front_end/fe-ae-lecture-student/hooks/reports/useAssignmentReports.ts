// hooks/reports/useAssignmentReports.ts
"use client";

import { useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { AssignmentReportsQuery } from "@/types/reports/reports.payload";
import type { AssignmentReportsResponse } from "@/types/reports/reports.response";

export function useAssignmentReports() {
  const [loading, setLoading] = useState(false);

  const fetchAssignmentReports = async (
    args: AssignmentReportsQuery
  ): Promise<AssignmentReportsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getByAssignment(args);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { fetchAssignmentReports, loading };
}
