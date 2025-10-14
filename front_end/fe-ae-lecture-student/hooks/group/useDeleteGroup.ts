"use client";

import { GroupService } from "@/services/group.services";
import { DeleteGroupResponse } from "@/types/group/group.response";
import { useCallback, useState } from "react";

export function useDeleteGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGroup = useCallback(
    async (groupId: string): Promise<DeleteGroupResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await GroupService.deleteGroup(groupId);
        return res;
      } catch (e: any) {
        setError(e?.message || "Failed to delete group");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { deleteGroup, loading, error };
}
