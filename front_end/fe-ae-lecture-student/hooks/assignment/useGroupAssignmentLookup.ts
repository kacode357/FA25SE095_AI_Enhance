"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { GetGroupAssignmentLookupResponse } from "@/types/assignments/assignment.response";

export function useGroupAssignmentLookup() {
  const [data, setData] = useState<GetGroupAssignmentLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignmentByGroup = async (groupId: string) => {
    setLoading(true);
    try {
      const res = await AssignmentService.getAssignmentByGroupId(groupId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchAssignmentByGroup };
}
