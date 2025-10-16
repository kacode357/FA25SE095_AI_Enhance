"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { useState } from "react";
import { toast } from "sonner";

export function useImportTemplate() {
  const [loading, setLoading] = useState(false);

  const downloadImportTemplate = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await EnrollmentsService.downloadImportTemplate();

      const url = window.URL.createObjectURL(res.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download student import template");
    } finally {
      setLoading(false);
    }
  };

  return { downloadImportTemplate, loading };
}
