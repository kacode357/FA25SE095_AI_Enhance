"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { GetCourseAssignmentStatsResponse } from "@/types/assignments/assignment.response";

export function useCourseAssignmentStats() {
  const [data, setData] = useState<GetCourseAssignmentStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCourseAssignmentStats = async (courseId: string) => {
    setLoading(true);
    try {
      const res = await AssignmentService.statsByCourse(courseId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchCourseAssignmentStats };
}
