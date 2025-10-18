"use client";

import { GroupService } from "@/services/group.services";
import { GetGroupsByCourseIdResponse, GroupDetail } from "@/types/group/group.response";
import { useCallback, useState } from "react";

const cache = new Map<string, GetGroupsByCourseIdResponse>();

export function useGroupsByCourseId() {
  const [listData, setListData] = useState<GroupDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByCourseId = useCallback(async (courseId: string, force = false) => {
    if (!courseId) return null;
    const key = courseId;
    
    if (!force && cache.has(key)) {
      const cached = cache.get(key)!;
      setListData(cached.groups || []);
      return cached;
    }

    setLoading(true);

    try {
      const res = await GroupService.getByCourseId(courseId);
      
      cache.set(key, res);
      setListData(res.groups || []);
      return res;
      
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = (courseId: string) => fetchByCourseId(courseId, true);

  return { listData, loading, fetchByCourseId, refetch };
}