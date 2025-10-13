"use client";

import { AssignmentService } from "@/services/assignment.services";
import { AssignmentDetail, GetAssignmentsByCourseIdResponse } from "@/types/assignment/assignment.response";
import { useCallback, useState } from "react";

const cache = new Map<string, GetAssignmentsByCourseIdResponse>();

export function useAssignmentsByCourseId() {
  const [listData, setListData] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCourseId = useCallback(async (courseId: string, force = false) => {
    if (!courseId) return null;
    const key = courseId;
    if (!force && cache.has(key)) {
      const cached = cache.get(key)!;
      setListData(cached.assignments || []);
      return cached;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await AssignmentService.getByCourseId(courseId);
      cache.set(key, res);
      setListData(res.assignments || []);
      return res;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch assignments");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = (courseId: string) => fetchByCourseId(courseId, true);

  return { listData, loading, error, fetchByCourseId, refetch };
}
