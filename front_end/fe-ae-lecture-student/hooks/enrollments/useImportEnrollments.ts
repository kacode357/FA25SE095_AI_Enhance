"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { ImportEnrollmentsPayload } from "@/types/enrollments/enrollments.payload";
import { ImportEnrollmentsResponse } from "@/types/enrollments/enrollments.response";
import { useState } from "react";
import { toast } from "sonner";

export function useImportEnrollments() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const importEnrollments = async (
    data: ImportEnrollmentsPayload
  ): Promise<ImportEnrollmentsResponse | null> => {
    setLoading(true);
    setErrors([]);

    try {
      const response = await EnrollmentsService.importEnrollments(data);

      if (response.success) {
        toast.success(
          `Imported ${response.successfulEnrollments}/${response.totalRows} enrollments successfully`
        );

        if (response.failedEnrollments > 0 && response.errors?.length) {
          setErrors(response.errors);
          toast.warning(`${response.failedEnrollments} enrollments failed to import`);
        }
      } else {
        toast.error(response.message || "Import failed");
        if (response.errors?.length) setErrors(response.errors);
      }

      return response;
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors || [];
      const message = error?.response?.data?.errors || "Failed to import enrollments";

      if (apiErrors.length) setErrors(apiErrors);

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { importEnrollments, loading, errors, setErrors };
}
