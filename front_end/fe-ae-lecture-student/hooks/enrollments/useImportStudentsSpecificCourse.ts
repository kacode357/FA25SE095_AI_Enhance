"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { ImportStudentsSpecificCoursePayload } from "@/types/enrollments/enrollments.payload";
import { ImportStudentsSpecificCourseResponse } from "@/types/enrollments/enrollments.response";
import { useState } from "react";
import { toast } from "sonner";

export function useImportStudentsSpecificCourse() {
  const [loading, setLoading] = useState(false);

  const importStudents = async (
    data: ImportStudentsSpecificCoursePayload
  ): Promise<ImportStudentsSpecificCourseResponse | null> => {
    setLoading(true);
    try {
      const response = await EnrollmentsService.importStudentsSpecificCourse(
        data
      );

      if (response.success) {
        toast.success(
          `Imported ${response.successfulEnrollments}/${response.totalRows} students successfully`
        );

        if (response.studentsCreated > 0) {
          toast.success(
            `${response.studentsCreated} new student accounts created`
          );
        }

      } else {
      }

      return response;
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during import");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { importStudents, loading };
}
