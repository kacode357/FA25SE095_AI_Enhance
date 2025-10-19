"use client";

import { GroupMembersService } from "@/services/group-member.services";
import { GroupMember } from "@/types/group-members/group-member.response";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useAllMembers() {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMembers = useCallback(async (groupId: string) => {
    if (!groupId) {
      setError("Missing groupId");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res: any = await GroupMembersService.getAllMembers(groupId);
      // 👇 hỗ trợ cả res.members lẫn res.data?.members
      const list: GroupMember[] =
        res?.members ??
        res?.data?.members ??
        [];

      console.debug("[useAllMembers] groupId:", groupId, "members:", list);

      if (res?.success === false) {
        toast.error(res?.message || "Failed to load members");
      }
      setMembers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      const msg = err?.message || "Error fetching members";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    members,
    loading,
    error,
    fetchAllMembers,
  };
}
