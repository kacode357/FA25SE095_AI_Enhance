"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { ImportStudentsSpecificCoursePayload } from "@/types/enrollments/enrollments.payload";
import { ImportStudentsSpecificCourseResponse } from "@/types/enrollments/enrollments.response";
import { useState } from "react";
import { toast } from "sonner";

export function useImportStudentsSpecificCourse() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const importStudents = async (
    data: ImportStudentsSpecificCoursePayload
  ): Promise<ImportStudentsSpecificCourseResponse | null> => {
    setLoading(true);
    setErrors([]);
    try {
      const response = await EnrollmentsService.importStudentsSpecificCourse(data);

      if (response.success) {
        toast.success(
          `Imported ${response.successfulEnrollments}/${response.totalRows} students successfully`
        );

        if (response.failedEnrollments > 0 && response.errors?.length) {
          setErrors(response.errors);
          toast.warning(`${response.failedEnrollments} students failed to import`);
        }
      } else {
        toast.error(response.message || "Import failed");
        if (response.errors?.length) {
          setErrors(response.errors);
        }
      }

      return response;
    } catch (error: any) {
      const message =
        error?.response?.data?.errors || "Failed to import students";
      const apiErrors = error?.response?.data?.errors || [];

      if (apiErrors.length) setErrors(apiErrors);

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { importStudents, loading, errors, setErrors };
}
