"use client";

import { useState } from "react";
import { DashboardService } from "@/services/dashboard.services";
import type {
  StudentCurrentCoursesResponse,
} from "@/types/dashboard/dashboard.response";

export function useStudentCurrentCourses() {
  const [data, setData] =
    useState<StudentCurrentCoursesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrentCourses = async (termId: string) => {
    setLoading(true);
    try {
      const res =
        await DashboardService.getStudentCurrentCourses(termId);
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchCurrentCourses };
}
