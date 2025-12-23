"use client";

import TemplateService from "@/services/template.services";
import type { ReportPreviewResponse } from "@/types/templates/template.response";
import { useState } from "react";

export function useTemplateReportPreview() {
  const [loading, setLoading] = useState(false);

  const getReportPreview = async (): Promise<ReportPreviewResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await TemplateService.getReportPreview();
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getReportPreview, loading } as const;
}
