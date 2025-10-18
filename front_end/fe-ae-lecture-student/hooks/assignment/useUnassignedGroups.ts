"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { GetUnassignedGroupsResponse } from "@/types/assignments/assignment.response";

export function useUnassignedGroups() {
  const [data, setData] = useState<GetUnassignedGroupsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUnassignedGroups = async (courseId: string) => {
    setLoading(true);
    try {
      const res = await AssignmentService.getUnassignedGroupsInCourse(courseId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchUnassignedGroups };
}
