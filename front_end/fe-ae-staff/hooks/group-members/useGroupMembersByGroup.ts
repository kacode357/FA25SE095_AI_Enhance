// hooks/group-members/useGroupMembersByGroup.ts
"use client";

import { useCallback, useState } from "react";
import { GroupMembersService } from "@/services/group-members.services";
import type { GetGroupMembersByGroupResponse } from "@/types/group-members/group-members.response";

export function useGroupMembersByGroup() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetGroupMembersByGroupResponse | null>(null);

  /** ✅ Lấy toàn bộ members theo groupId */
  const fetchGroupMembers = useCallback(async (groupId: string) => {
    if (!groupId) return null;
    setLoading(true);
    try {
      const res = await GroupMembersService.getByGroup(groupId);
      setData(res);
      return res;
    } catch {
      // interceptor chung handle lỗi
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** ✅ Reset state */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
  }, []);

  /** Tiện alias */
  const members = data?.members ?? [];

  return { data, members, loading, fetchGroupMembers, reset };
}
