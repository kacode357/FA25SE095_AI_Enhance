"use client";

import TemplateService from "@/services/template.services";
import { useState } from "react";

export function useTemplateReportDownload() {
  const [loading, setLoading] = useState(false);

  const downloadTemplate = async (): Promise<Blob | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const blob = await TemplateService.getReportDownload();
      return blob;
    } finally {
      setLoading(false);
    }
  };

  return { downloadTemplate, loading } as const;
}
