"use client";

import { GroupService } from "@/services/group.services";
import { GroupDetail } from "@/types/group/group.response";
import { useCallback, useState } from "react";

const cache = new Map<string, GroupDetail>();

export function useGroupById() {
  const [data, setData] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupById = useCallback(async (groupId: string, force = false) => {
    if (!groupId) return null;
    if (!force && cache.has(groupId)) {
      const cached = cache.get(groupId)!;
      setData(cached);
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await GroupService.getById(groupId);
      cache.set(groupId, res);
      setData(res);
      return res;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch group detail");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = (groupId: string) => fetchGroupById(groupId, true);

  return { data, loading, error, fetchGroupById, refetch };
}
