// hooks/assignment/useAssignmentDetail.ts
"use client";

import { useCallback, useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import type { GetAssignmentByIdResponse } from "@/types/assignments/assignment.response";

export function useAssignmentDetail() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetAssignmentByIdResponse | null>(null);

  /** ✅ Fetch chi tiết assignment theo ID */
  const fetchAssignment = useCallback(async (id: string) => {
    if (!id) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.getById(id);
      setData(res);
      return res;
    } catch {
      // interceptor chung sẽ handle lỗi
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** ✅ Reset state khi rời màn hình */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
  }, []);

  /** Tiện: truy xuất nhanh object assignment */
  const assignment = data?.assignment ?? null;

  return { data, assignment, loading, fetchAssignment, reset };
}
