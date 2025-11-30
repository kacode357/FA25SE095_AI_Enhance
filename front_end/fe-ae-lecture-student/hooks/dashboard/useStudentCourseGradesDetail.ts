"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  StudentCourseGradesDetailResponse,
} from "@/types/dashboard/dashboard.response";

export function useStudentCourseGradesDetail() {
  const [data, setData] =
    useState<StudentCourseGradesDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCourseGrades = async (courseId: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getStudentCourseGradesDetail(courseId);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchCourseGrades };
}
