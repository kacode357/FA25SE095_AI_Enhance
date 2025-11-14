"use client";

import { ReportsService } from "@/services/reports.services";
import { GetCourseReportsQuery } from "@/types/reports/reports.payload";
import { GetCourseReportsResponse } from "@/types/reports/reports.response";
import { useState } from "react";

export function useGetReportByCourse() {
  const [loading, setLoading] = useState(false);

  const getReportByCourse = async (
    params: GetCourseReportsQuery
  ): Promise<GetCourseReportsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ReportsService.getByCourse(params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getReportByCourse, loading };
}
