// hooks/useUnenrollStudent.ts
"use client";

import { EnrollmentsService } from "@/services/enrollments.services";
import { UnenrollStudentParams, UnenrollStudentPayload } from "@/types/enrollments/enrollments.payload";
import { UnenrollStudentResponse } from "@/types/enrollments/enrollments.response";
import { useState } from "react";
import { toast } from "sonner";

export function useUnenrollStudent() {
  const [loading, setLoading] = useState(false);

  const unenrollStudent = async (
    params: UnenrollStudentParams,
    body: UnenrollStudentPayload
  ): Promise<UnenrollStudentResponse | undefined> => {
    try {
      setLoading(true);

      const res = await EnrollmentsService.unenrollStudent(params, body);

      if (res.success) {
        toast.success(res.message || "Student unenrolled successfully");
      } else {
        toast.error(res.message || "Failed to unenroll student");
      }

      return res;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unenroll failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    unenrollStudent,
  };
}
