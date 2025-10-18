"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { ImportEnrollmentsPayload } from "@/types/enrollments/enrollments.payload";
import { ImportEnrollmentsResponse } from "@/types/enrollments/enrollments.response";
import { useState } from "react";
import { toast } from "sonner";

export function useImportEnrollments() {
  const [loading, setLoading] = useState(false);

  const importEnrollments = async (
    data: ImportEnrollmentsPayload
  ): Promise<ImportEnrollmentsResponse | null> => {
    setLoading(true);

    try {
      const response = await EnrollmentsService.importEnrollments(data);

      if (response.success) {
        toast.success(
          `Imported ${response.successfulEnrollments}/${response.totalRows} enrollments successfully`
        );

        if (response.failedEnrollments > 0) {
          toast.warning(`${response.failedEnrollments} enrollments failed to import`);
        }
      } else {
        toast.error(response.message || "Import failed");
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  return { importEnrollments, loading };
}