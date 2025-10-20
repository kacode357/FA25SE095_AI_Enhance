// hooks/assignment/useAssignments.ts
"use client";

import { useCallback, useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import type { GetAssignmentsQuery } from "@/types/assignments/assignment.payload";
import type { GetAssignmentsResponse } from "@/types/assignments/assignment.response";

export function useAssignments() {
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<GetAssignmentsResponse | null>(null);

  const fetchAssignments = useCallback(async (params: GetAssignmentsQuery) => {
    setLoading(true);
    try {
      const res = await AssignmentService.getAll(params);
      setListData(res);
      return res;
    } catch {
      // interceptor chung handle lỗi
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setListData(null);
    setLoading(false);
  }, []);

  return { listData, loading, fetchAssignments, reset };
}
    