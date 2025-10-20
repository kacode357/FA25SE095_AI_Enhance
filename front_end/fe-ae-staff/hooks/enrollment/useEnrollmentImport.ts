// hooks/enrollment/useEnrollmentImport.ts
"use client";

import { useCallback, useState } from "react";
import { EnrollmentsImportService } from "@/services/enrollments-import.services";
import type {
  EnrollmentImportPayload,
} from "@/types/enrollments/enrollment-import.payload";
import type {
  EnrollmentImportResponse,
} from "@/types/enrollments/enrollment-import.response";

export function useEnrollmentImport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EnrollmentImportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** ✅ Gửi file để import */
  const importEnrollments = useCallback(async (payload: EnrollmentImportPayload) => {
    if (!payload?.file) {
      setErrorMessage("Missing file to import.");
      return null;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await EnrollmentsImportService.import(payload);
      setData(res);
      return res;
    } catch (e: any) {
      // interceptor chung có thể set message; ta fallback đơn giản
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to import enrollments.";
      setErrorMessage(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setData(null);
    setErrorMessage(null);
  }, []);

  return { loading, data, errorMessage, importEnrollments, reset };
}
