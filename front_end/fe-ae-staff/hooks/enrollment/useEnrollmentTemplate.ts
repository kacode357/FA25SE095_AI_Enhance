// hooks/enrollment/useEnrollmentTemplate.ts
"use client";

import { useCallback, useState } from "react";
import { EnrollmentsImportService } from "@/services/enrollments-import.services";
import type { EnrollmentTemplateFile } from "@/types/enrollments/enrollment-import.response";

export function useEnrollmentTemplate() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<EnrollmentTemplateFile | null>(null);

  /** ✅ Tải template (không tự lưu) */
  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await EnrollmentsImportService.downloadTemplate();
      setFile(res);
      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** ✅ Tải và tự trigger download trên trình duyệt */
  const downloadTemplate = useCallback(async () => {
    const res = await fetchTemplate();
    if (!res) return null;

    const url = URL.createObjectURL(res.blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      // cleanup object URL
      URL.revokeObjectURL(url);
    }
    return res;
  }, [fetchTemplate]);

  const reset = useCallback(() => {
    setFile(null);
    setLoading(false);
  }, []);

  return { loading, file, fetchTemplate, downloadTemplate, reset };
}
