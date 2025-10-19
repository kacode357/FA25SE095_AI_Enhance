"use client";

import { useCallback, useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { GetAssignmentsQuery } from "@/types/assignments/assignment.payload";
import { GetAssignmentsResponse } from "@/types/assignments/assignment.response";

export function useAssignments() {
  const [listData, setListData] = useState<GetAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async (query: GetAssignmentsQuery) => {
    setLoading(true);
    try {
      const res = await AssignmentService.list(query);
      setListData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  return { listData, loading, fetchAssignments };
}
