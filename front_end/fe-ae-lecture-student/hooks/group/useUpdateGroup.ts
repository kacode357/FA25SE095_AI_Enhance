"use client";

import { GroupService } from "@/services/group.services";
import { UpdateGroupPayload } from "@/types/group/group.payload";
import { UpdateGroupsResponse } from "@/types/group/group.response";
import { useCallback, useState } from "react";

export function useUpdateGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGroup = useCallback(async (payload: UpdateGroupPayload): Promise<UpdateGroupsResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await GroupService.updateGroup(payload.groupId, payload);
      return res;
    } catch (e: any) {
      setError(e?.message || "Failed to update group");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateGroup, loading, error };
}
