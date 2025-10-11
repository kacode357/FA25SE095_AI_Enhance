// hooks/enrollments/useImportEnrollments.ts
"use client";

import { useState } from "react";
import { EnrollmentsService } from "@/services/enrollments.services";
import { ImportEnrollmentsPayload } from "@/types/enrollments/enrollments.payload";
import { ImportEnrollmentsResponse } from "@/types/enrollments/enrollments.response";
import { toast } from "sonner";

/**
 * ✅ Hook: useImportEnrollments
 * Import enrollments from Excel file (Lecturers & Staff only)
 */
export function useImportEnrollments() {
  const [loading, setLoading] = useState(false);

  const importEnrollments = async (
    payload: ImportEnrollmentsPayload
  ): Promise<ImportEnrollmentsResponse | null> => {
    setLoading(true);
    try {
      const res = await EnrollmentsService.importEnrollments(payload);
      toast.success(res.message || "Import enrollments thành công");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { importEnrollments, loading };
}
