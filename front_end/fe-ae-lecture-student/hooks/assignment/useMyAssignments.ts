"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { MyAssignmentsQuery } from "@/types/assignments/assignment.payload";
import { GetMyAssignmentsResponse } from "@/types/assignments/assignment.response";

export function useMyAssignments() {
  const [listData, setListData] = useState<GetMyAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMyAssignments = async (query: MyAssignmentsQuery) => {
    setLoading(true);
    try {
      const res = await AssignmentService.myAssignments(query);
      setListData(res);
    } finally {
      setLoading(false);
    }
  };

  return { listData, loading, fetchMyAssignments };
}
