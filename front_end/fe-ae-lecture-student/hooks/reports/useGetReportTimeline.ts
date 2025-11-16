"use client";

import { ReportsService } from "@/services/reports.services";
import { GetReportTimelinePayload } from "@/types/reports/reports.payload";
import { GetReportTimelineResponse } from "@/types/reports/reports.response";
import { useState } from "react";
import { toast } from "sonner";

export function useGetReportTimeline() {
  const [loading, setLoading] = useState(false);

  const getReportTimeline = async (
    params: GetReportTimelinePayload
  ): Promise<GetReportTimelineResponse | null> => {
    if (loading) return null;

    setLoading(true);
    try {
      const res = await ReportsService.getTimeline(params);
      return res;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load timeline.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getReportTimeline, loading };
}
