// hooks/assignment/useMyAssignments.ts
"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import type { MyAssignmentsQuery } from "@/types/assignments/assignment.payload";
import type { GetMyAssignmentsResponse } from "@/types/assignments/assignment.response";

export function useMyAssignments() {
  const [listData, setListData] = useState<GetMyAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMyAssignments = async (
    query: MyAssignmentsQuery
  ): Promise<GetMyAssignmentsResponse | null> => {
  

    setLoading(true);
    try {
      const res = await AssignmentService.myAssignments(query);
      setListData(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { listData, loading, fetchMyAssignments };
}
