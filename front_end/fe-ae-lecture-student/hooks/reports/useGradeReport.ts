"use client";

import { ReportsService } from "@/services/reports.services";
import type { GradeReportPayload } from "@/types/reports/reports.payload";
import type { GradeReportResponse } from "@/types/reports/reports.response";
import { useState } from "react";
import { toast } from "sonner";

export function useGradeReport() {
  const [loading, setLoading] = useState(false);

  const gradeReport = async (
    payload: GradeReportPayload
  ): Promise<GradeReportResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.grade(payload);
      toast.success("Report graded successfully!");
      return res;
    } catch (err) {
      toast.error("Failed to grade report");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { gradeReport, loading };
}
