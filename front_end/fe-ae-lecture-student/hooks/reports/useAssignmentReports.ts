// hooks/reports/useAssignmentReports.ts
"use client";

import { useCallback, useRef, useState } from "react";
import { ReportsService } from "@/services/reports.services";
import type { AssignmentReportsQuery } from "@/types/reports/reports.payload";
import type { AssignmentReportsResponse } from "@/types/reports/reports.response";

export function useAssignmentReports() {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const fetchAssignmentReports = useCallback(
    async (args: AssignmentReportsQuery): Promise<AssignmentReportsResponse | null> => {
      if (loadingRef.current) return null; // chặn gọi chồng
      loadingRef.current = true;
      setLoading(true);

      try {
        const res = await ReportsService.getByAssignment(args);
        return res;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  return { fetchAssignmentReports, loading };
}
