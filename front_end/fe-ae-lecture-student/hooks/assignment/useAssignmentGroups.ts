"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { GetAssignmentGroupsResponse } from "@/types/assignments/assignment.response";

export function useAssignmentGroups() {
  const [data, setData] = useState<GetAssignmentGroupsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignmentGroups = async (assignmentId: string) => {
    setLoading(true);
    try {
      const res = await AssignmentService.getGroups(assignmentId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchAssignmentGroups };
}
