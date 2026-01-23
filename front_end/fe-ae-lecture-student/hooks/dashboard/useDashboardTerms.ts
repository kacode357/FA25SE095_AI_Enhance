"use client";

import { DashboardService } from "@/services/dashboard.services";
import type { DashboardTermsResponse } from "@/types/dashboard/dashboard.response";
import { useState } from "react";

export function useDashboardTerms() {
  const [data, setData] = useState<DashboardTermsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await DashboardService.getTerms();
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchTerms };
}
