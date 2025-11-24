"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import type { GetStudentCourseGradesResponse } from "@/types/assignments/assignment.response";

export function useStudentCourseGrades() {
  const [loading, setLoading] = useState(false);

  const getStudentCourseGrades = async (
    courseId: string
  ): Promise<GetStudentCourseGradesResponse | null> => {
    if (loading) return null;
    if (!courseId) return null;

    setLoading(true);
    try {
      const res = await AssignmentService.getStudentGradesByCourse(courseId);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getStudentCourseGrades, loading };
}
